import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MetricSchema = z.object({
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
});

const BulkSchema = z.object({
  metrics: z.array(MetricSchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { facilityId } = session.user;

  const results = await Promise.all(
    parsed.data.metrics.map(m =>
      prisma.qapiMetric.upsert({
        where: {
          facilityId_metricKey_month_year: {
            facilityId,
            metricKey: m.metricKey,
            month: m.month,
            year: m.year,
          },
        },
        update: {
          value: m.value,
          target: m.target ?? null,
          unit: m.unit ?? null,
          numerator: m.numerator ?? null,
          denominator: m.denominator ?? null,
          metricName: m.metricName,
          category: m.category as never,
        },
        create: {
          facilityId,
          metricKey: m.metricKey,
          metricName: m.metricName,
          category: m.category as never,
          month: m.month,
          year: m.year,
          value: m.value,
          target: m.target ?? null,
          unit: m.unit ?? null,
          numerator: m.numerator ?? null,
          denominator: m.denominator ?? null,
        },
      })
    )
  );

  return NextResponse.json({ saved: results.length });
}
