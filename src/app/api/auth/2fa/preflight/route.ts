import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { passwordHash: true, isActive: true, totpEnabled: true },
  });

  // Same response for invalid user as wrong password — avoid user enumeration
  if (!user || !user.passwordHash || !user.isActive) {
    return NextResponse.json({ requires2fa: false });
  }

  const passwordValid = await compare(parsed.data.password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json({ requires2fa: false });
  }

  return NextResponse.json({ requires2fa: user.totpEnabled });
}
