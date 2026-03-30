import { Router, type IRouter } from "express";
import { db, adminsTable, notificationsTable, eq } from "@workspace/db";
import crypto from "crypto";
import { sendOTPEmail, sendRegistrationOTPEmail } from "../lib/mailer";

const router: IRouter = Router();

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * --- REGISTER FLOW ---
 * Step 1: Request OTP for new account
 */
router.post("/register/request-otp", async (req, res) => {
  const { username, employeeId } = req.body;
  if (!username || !employeeId) {
    res.status(400).json({ error: "Email (username) and Employee ID are required" });
    return;
  }

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Check if user already exists
    const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
    if (existing) {
      if (existing.status !== "unverified") {
        res.status(400).json({ error: "User already exists." });
        return;
      }
      // Update OTP for existing unverified user
      await db.update(adminsTable)
        .set({ otp, otpExpiresAt: expiresAt })
        .where(eq(adminsTable.id, existing.id));
    } else {
      // Create new unverified user
      await db.insert(adminsTable).values({
        username,
        employeeId,
        status: "unverified",
        otp,
        otpExpiresAt: expiresAt,
      });
    }

    // console.log(`\n\n===============================\n[MOCK EMAIL - REGISTRATION]\nTo: ${username}\nYour Medifind Registration OTP is: ${otp}\n===============================\n\n`);
    await sendRegistrationOTPEmail(username, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: "Employee ID already exists" });
    } else {
      console.error('❌ Email send error (registration):', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack,
      });
      res.status(500).json({ 
        error: "Failed to send registration OTP", 
        details: error.message 
      });
    }
  }
});

/**
 * Step 2: Verify OTP for new account
 */
router.post("/register/verify-otp", async (req, res) => {
  const { username, otp } = req.body;
  
  if (!username || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  try {
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
    if (!admin) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (admin.otp !== otp) {
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    if (!admin.otpExpiresAt || new Date(admin.otpExpiresAt).getTime() < Date.now()) {
      res.status(401).json({ error: "OTP expired" });
      return;
    }

    // Set to pending approval
    const [updatedAdmin] = await db.update(adminsTable)
      .set({ status: "pending", otp: null, otpExpiresAt: null })
      .where(eq(adminsTable.id, admin.id))
      .returning();

    // Create notification for other admins
    await db.insert(notificationsTable).values({
      type: "new_employee_signup",
      message: `New employee signup: ${username} (ID: ${updatedAdmin.employeeId})`,
      metadata: JSON.stringify({ adminId: updatedAdmin.id, username, employeeId: updatedAdmin.employeeId }),
    });

    res.json({ 
      id: updatedAdmin.id, 
      username: updatedAdmin.username, 
      status: updatedAdmin.status,
      message: "Email verified. Waiting for admin approval." 
    });
  } catch (err: any) {
    console.error("Register verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * --- LOGIN FLOW ---
 * Step 1: Request OTP for existing approved account
 */
router.post("/login/request-otp", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
    
    if (!admin) {
      // Don't leak whether the user exists for security, but since this is internal admin, we can be helpful.
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (admin.status !== "active") {
      res.status(403).json({ error: "Your account is not active. Please contact your administrator." });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.update(adminsTable)
      .set({ otp, otpExpiresAt: expiresAt })
      .where(eq(adminsTable.id, admin.id));

    await sendOTPEmail(username, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err: any) {
    console.error('❌ Email send error (login):', {
      message: err.message,
      code: err.code,
      response: err.response,
      stack: err.stack,
    });
    res.status(500).json({ 
      error: "Failed to send login OTP", 
      details: err.message 
    });
  }
});

/**
 * Step 2: Verify OTP and set login cookie
 */
router.post("/login/verify-otp", async (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  try {
    const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
    
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (admin.status !== "active") {
      res.status(403).json({ error: "Your account is not active. Please contact your administrator." });
      return;
    }

    if (admin.otp !== otp) {
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    if (!admin.otpExpiresAt || new Date(admin.otpExpiresAt).getTime() < Date.now()) {
      res.status(401).json({ error: "OTP expired" });
      return;
    }

    // Clear OTP so it can't be reused
    await db.update(adminsTable)
      .set({ otp: null, otpExpiresAt: null })
      .where(eq(adminsTable.id, admin.id));

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("admin_id", admin.id.toString(), { 
      httpOnly: true, 
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3600000 // 1 hour
    });

    res.json({ id: admin.id, username: admin.username, employeeId: admin.employeeId, status: admin.status });
  } catch (err: any) {
    console.error("Login verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("admin_id");
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const adminId = req.cookies?.admin_id;
  if (!adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.id, parseInt(adminId)));
  if (!admin) {
    res.status(401).json({ error: "Admin not found" });
    return;
  }

  res.json({ id: admin.id, username: admin.username, employeeId: admin.employeeId, status: admin.status });
});

router.post("/approve", async (req, res) => {
  const currentAdminId = req.cookies?.admin_id;
  if (!currentAdminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { adminId: targetAdminId, action } = req.body;
  if (!targetAdminId || !['approved', 'rejected'].includes(action)) {
    res.status(400).json({ error: "Admin ID and valid action (approved/rejected) are required" });
    return;
  }

  try {
    const [updatedAdmin] = await db
      .update(adminsTable)
      .set({ status: action })
      .where(eq(adminsTable.id, parseInt(targetAdminId)))
      .returning();

    if (!updatedAdmin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json({ message: `Admin ${action} correctly`, admin: updatedAdmin });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
