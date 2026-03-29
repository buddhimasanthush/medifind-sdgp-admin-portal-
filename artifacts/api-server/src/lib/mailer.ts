import nodemailer from "nodemailer";

/**
 * Configure the SMTP transporter using environment variables.
 * For Gmail, use an App Password (16 characters, no spaces).
 * SECURE: false is required for port 587 (STARTTLS).
 * TLS: rejectUnauthorized: false is added for smoother handshakes in Railway.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""), // Ensure no spaces
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Verify the SMTP transporter on server startup to catch config errors immediately.
 */
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP transporter verification failed:', {
      message: error.message,
      stack: error.stack
    });
  } else {
    console.log('✅ SMTP transporter is ready to send emails');
  }
});

/**
 * Send an OTP email to the user.
 */
export async function sendOTPEmail(to: string, otp: string, type: "login" | "registration" = "login") {
  const subject = type === "login" ? "Medifind Login OTP" : "Medifind Registration OTP";
  const body = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0d9488; text-align: center;">Medifind Admin</h2>
      <p>Hello,</p>
      <p>Your OTP for <strong>${type}</strong> is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  return await transporter.sendMail({
    from: `"Medifind Admin" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html: body,
  });
}
