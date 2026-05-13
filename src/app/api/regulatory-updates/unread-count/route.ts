import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/regulatory-updates/unread-count
// Returns the number of active regulatory updates the current user has NOT yet acknowledged.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ count: 0 });

  const userId = session.user.id;

  // Get IDs the user has already acknowledged
  const acked = await prisma.regulatoryUpdateAck.findMany({
    where: { userId },
    select: { updateId: true },
  });
  const ackedIds = acked.map((a) => a.updateId);

  const count = await prisma.regulatoryUpdate.count({
    where: {
      isActive: true,
      ...(ackedIds.length > 0 ? { id: { notIn: ackedIds } } : {}),
    },
  });

  return NextResponse.json({ count });
}
