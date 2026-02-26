import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpsertSchema = z.object({
  metricName: z.string().min(1),
  metricKey: z.string().min(1),
  category: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  value: z.number(),
  target: z.number().optional(),
  unit: z.string().optional(),
  numerator: z.number().optional(),
  denominator: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const category = searchParams.get('category') ?? undefined;

  const metrics = await prisma.qapiMetric.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(year ? { year } : {}),
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  return NextResponse.json(metrics);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { facilityId } = session.user;

  const metric = await prisma.qapiMetric.upsert({
    where: {
      facilityId_metricKey_month_year: {
        facilityId,
        metricKey: parsed.data.metricKey,
        month: parsed.data.month,
        year: parsed.data.year,
      },
    },
    update: {
      value: parsed.data.value,
      target: parsed.data.target,
      numerator: parsed.data.numerator,
      denominator: parsed.data.denominator,
      notes: parsed.data.notes,
    },
    create: {
      facilityId,
      ...parsed.data,
      category: parsed.data.category as any,
    },
  });

  return NextResponse.json(metric, { status: 201 });
}
