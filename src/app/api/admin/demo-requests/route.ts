import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const requests = await prisma.demoRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, reviewed } = await req.json();
  await prisma.demoRequest.update({ where: { id }, data: { reviewed } });
  return NextResponse.json({ ok: true });
}
