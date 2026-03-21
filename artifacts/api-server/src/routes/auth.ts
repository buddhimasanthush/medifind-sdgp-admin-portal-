import { Router, type IRouter } from "express";
import { db, adminsTable, notificationsTable, eq, and } from "@workspace/db";
import { hashPassword, verifyPassword } from "../lib/hash.js";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  const { username, password, employeeId } = req.body;
  if (!username || !password || !employeeId) {
    res.status(400).json({ error: "Username, password and Employee ID are required" });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    
    // Check if this is the first admin (optional bootstrap logic)
    // For simplicity, following the user request for all new signups to be pending.
    
    const [admin] = await db.insert(adminsTable).values({
      username,
      passwordHash,
      employeeId,
      status: "pending", // Explicitly set to pending
    }).returning();
    
    // Create notification for other admins
    await db.insert(notificationsTable).values({
      type: "new_employee_signup",
      message: `New employee signup: ${username} (ID: ${employeeId})`,
      metadata: JSON.stringify({ adminId: admin.id, username, employeeId }),
    });
    
    // Do NOT set cookie upon registration if pending
    res.status(201).json({ 
      id: admin.id, 
      username: admin.username, 
      employeeId: admin.employeeId,
      status: admin.status,
      message: "Signup successful. Waiting for admin approval."
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: "Username or Employee ID already exists" });
    } else {
      console.error("Register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (admin.status !== "approved") {
    res.status(403).json({ error: `Account status is ${admin.status}. Please wait for admin approval.` });
    return;
  }

  res.cookie("admin_id", admin.id.toString(), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000 // 1 hour
  });

  res.json({ id: admin.id, username: admin.username, employeeId: admin.employeeId, status: admin.status });
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

// New endpoint for approving admins
router.post("/approve", async (req, res) => {
  const currentAdminId = req.cookies?.admin_id;
  if (!currentAdminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { adminId: targetAdminId, action } = req.body; // action: 'approved' or 'rejected'
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
