import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || `"Kroma" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function passwordResetEmailHtml(resetUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #14161a;">
      <h2 style="margin-bottom: 8px;">Reset your Kroma password</h2>
      <p style="color: #6b6f76; font-size: 14px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to choose a new one.
        This link will expire in 15 minutes.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block; margin: 20px 0; padding: 12px 24px; background:#14161a; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:600;">
        Reset Password
      </a>
      <p style="color: #6b6f76; font-size: 13px;">
        If you didn't request this, you can safely ignore this email — your password will remain unchanged.
      </p>
    </div>
  `;
}
