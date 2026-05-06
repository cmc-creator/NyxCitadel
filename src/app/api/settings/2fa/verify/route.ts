import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifySync } from 'otplib';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(6).max(6),
  backupCodes: z.array(z.string()).length(8),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user?.totpSecret) return NextResponse.json({ error: 'Run setup first.' }, { status: 400 });
  if (user.totpEnabled) return NextResponse.json({ error: '2FA already enabled.' }, { status: 400 });

  const result = verifySync({ token: parsed.data.token, secret: user.totpSecret });
  if (!result.valid) return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 422 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totpEnabled: true,
      backupCodes: parsed.data.backupCodes,
    },
  });

  return NextResponse.json({ ok: true });
}
