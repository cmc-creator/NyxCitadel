import nodemailer from 'nodemailer';

function createTransport() {
  // In production set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in your env.
  // Falls back to Ethereal-style test account behaviour is not configured.
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Skip sending in test / CI environments
  if (process.env.NODE_ENV === 'test') return;

  const from = process.env.EMAIL_FROM ?? 'Citadel <noreply@nyxcitadel.com>';
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, html });
}
