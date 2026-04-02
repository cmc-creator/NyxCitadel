import { NextResponse } from 'next/server';
import { getSmtpReadiness, verifySmtpConnection } from '@/lib/email';

export async function GET() {
  const readiness = getSmtpReadiness();
  if (!readiness.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: 'SMTP is not configured.',
        missing: readiness.missing,
      },
      { status: 503 },
    );
  }

  const verification = await verifySmtpConnection();
  if (!verification.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: 'SMTP configuration exists but connection test failed.',
        error: verification.error,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'SMTP connection verified.',
  });
}
