import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  console.log(`📧 Sending OTP to: ${to}`);
  const { data, error } = await resend.emails.send({
    from: 'Medifind Admin <onboarding@resend.dev>',
    to: [to],
    subject: 'Your Medifind Admin Login Code',
    html: `<div style="font-family:Arial,sans-serif;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:12px;max-width:480px;margin:0 auto"><h2 style="color:#0ea5e9;text-align:center">Medifind Admin</h2><div style="background:#1e293b;border-radius:8px;padding:24px;text-align:center"><p style="color:#cbd5e1">Your login code:</p><div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0ea5e9;padding:16px;background:#0f172a;border-radius:8px">${otp}</div><p style="color:#64748b;font-size:13px;margin-top:16px">Expires in 10 minutes</p></div></div>`,
  });
  if (error) {
    console.error('❌ Resend error:', error);
    throw new Error(`Email failed: ${error.message}`);
  }
  console.log(`✅ OTP sent successfully. ID: ${data?.id}`);
}

export async function sendRegistrationOTPEmail(to: string, otp: string): Promise<void> {
  console.log(`📧 Sending registration OTP to: ${to}`);
  const { data, error } = await resend.emails.send({
    from: 'Medifind Admin <onboarding@resend.dev>',
    to: [to],
    subject: 'Complete Your Medifind Admin Registration',
    html: `<div style="font-family:Arial,sans-serif;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:12px;max-width:480px;margin:0 auto"><h2 style="color:#0ea5e9;text-align:center">Medifind Admin</h2><div style="background:#1e293b;border-radius:8px;padding:24px;text-align:center"><p style="color:#cbd5e1">Your registration code:</p><div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0ea5e9;padding:16px;background:#0f172a;border-radius:8px">${otp}</div><p style="color:#64748b;font-size:13px;margin-top:16px">Expires in 10 minutes</p></div></div>`,
  });
  if (error) {
    console.error('❌ Resend registration error:', error);
    throw new Error(`Registration email failed: ${error.message}`);
  }
  console.log(`✅ Registration OTP sent. ID: ${data?.id}`);
}
