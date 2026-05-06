import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, totpEnabled: true },
  });

  if (!user?.passwordHash) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const passwordValid = await compare(parsed.data.password, user.passwordHash);
  if (!passwordValid) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: false, totpSecret: null, backupCodes: [] },
  });

  return NextResponse.json({ ok: true });
}
