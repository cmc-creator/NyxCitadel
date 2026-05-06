import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({ email: z.string().email() });

// Always return 200 to prevent user enumeration
const OK = NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return OK; }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return OK;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, name: true, email: true, isActive: true },
  });

  // Don't reveal whether the email exists
  if (!user || !user.isActive) return OK;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://app.nyxcitadel.com';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your NyxCitadel password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0d7377;">Password Reset Request</h2>
          <p>Hi ${user.name ?? 'there'},</p>
          <p>We received a request to reset the password for your NyxCitadel account.</p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}"
               style="background:#0d7377;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
          </p>
          <p style="color:#666;font-size:13px;">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">NyxCitadel · HIPAA-compliant compliance platform</p>
        </div>
      `,
    });
  } catch {
    // Log but don't reveal email failure to client
    console.error('[forgot-password] email send failed for user', user.id);
  }

  return OK;
}
