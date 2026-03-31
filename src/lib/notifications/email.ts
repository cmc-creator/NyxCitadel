import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM;

  if (!host || !port || !from) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
  };
}

export async function sendNotificationEmail(payload: EmailPayload): Promise<void> {
  const cfg = getSmtpConfig();
  if (!cfg) return;

  try {
    const transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    });

    await transport.sendMail({
      from: cfg.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  } catch {
    // Non-fatal for alert generation.
  }
}
