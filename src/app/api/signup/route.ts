import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { getOnboardingWelcomeEmail } from '@/lib/email-templates';
import { enforceRateLimit } from '@/lib/security/rate-limit';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  facility: z.string().min(1).max(200),
  facilityType: z.string().max(50).optional(),
  beds: z.string().max(10).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const limit = enforceRateLimit(req, 'signup', 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data', issues: parsed.error.issues }, { status: 422 });
  }

  const { name, email, facility, facilityType, beds, phone, message } = parsed.data;

  // 1. Send acknowledgement email to the prospect
  const welcome = getOnboardingWelcomeEmail({ facilityName: facility, contactName: name, contactEmail: email });
  await sendEmail({ to: email, subject: welcome.subject, html: welcome.html });

  // 2. Notify the sales/admin team
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New demo request from ${name} — ${facility}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Facility:</strong> ${facility}</p>
        ${facilityType ? `<p><strong>Type:</strong> ${facilityType}</p>` : ''}
        ${beds ? `<p><strong>Beds:</strong> ${beds}</p>` : ''}
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
