import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type AuditPayload = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes?: unknown;
  req?: NextRequest;
};

function getIpAddress(req?: NextRequest): string | null {
  if (!req) return null;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: payload.userId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        changes: payload.changes ?? undefined,
        ipAddress: getIpAddress(payload.req),
        userAgent: payload.req?.headers.get('user-agent') ?? null,
      },
    });
  } catch {
    // Do not block primary workflows if audit write fails.
  }
}
