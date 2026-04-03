import nodemailer from 'nodemailer';

type SmtpReadiness = {
  ok: boolean;
  missing: string[];
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'Citadel <noreply@nyxcitadel.com>';

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    user,
    pass,
    from,
  };
}

export function getSmtpReadiness(): SmtpReadiness {
  const cfg = getSmtpConfig();
  const missing: string[] = [];

  if (!cfg.host) missing.push('SMTP_HOST');
  if (!cfg.port || Number.isNaN(cfg.port)) missing.push('SMTP_PORT');
  if (!cfg.user) missing.push('SMTP_USER');
  if (!cfg.pass) missing.push('SMTP_PASSWORD');
  if (!cfg.from) missing.push('SMTP_FROM or EMAIL_FROM');

  return { ok: missing.length === 0, missing };
}

function createTransport() {
  const cfg = getSmtpConfig();

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
}

export async function verifySmtpConnection() {
  const readiness = getSmtpReadiness();
  if (!readiness.ok) {
    return {
      ok: false,
      error: `Missing SMTP settings: ${readiness.missing.join(', ')}`,
    };
  }

  try {
    const transporter = createTransport();
    await transporter.verify();
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'SMTP verification failed',
    };
  }
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

  const readiness = getSmtpReadiness();
  if (!readiness.ok) {
    throw new Error(`Missing SMTP settings: ${readiness.missing.join(', ')}`);
  }

  const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'Citadel <noreply@nyxcitadel.com>';
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, html });
}
