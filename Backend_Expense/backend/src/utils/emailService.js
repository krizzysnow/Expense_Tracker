const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification OTP – Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #1a1a2e; border-radius: 12px; color: #e2e8f0;">
          <h1 style="color: #6366f1; margin-bottom: 8px; text-align:center;">Expense Tracker</h1>
          <p style="color: #94a3b8; text-align:center; margin-bottom: 28px;">Use the OTP below to verify your email address. It expires in <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
          <div style="background: #0f172a; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 12px 0; letter-spacing: 1px; text-transform: uppercase;">Your OTP Code</p>
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 14px; color: #6366f1; font-family: 'Courier New', monospace;">${otp}</div>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center;">If you did not create an account, you can safely ignore this email.</p>
        </div>
      `
    });
    return { success: true };
  } catch (err) {
    console.error('[emailService] Failed to send OTP email:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendOTPEmail };