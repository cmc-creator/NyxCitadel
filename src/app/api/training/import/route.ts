import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = [
  'ORIENTATION','ANNUAL_MANDATORY','EMERGENCY_MANAGEMENT','FIRE_SAFETY',
  'INFECTION_CONTROL','CPR_BLS','CPI_DE_ESCALATION','SUICIDE_RISK',
  'RESTRAINT_SECLUSION','MEDICATION_MANAGEMENT','HIPAA_PRIVACY',
  'CLINICAL_COMPETENCY','LEADERSHIP','HAZMAT','OTHER',
];

const VALID_STATUSES = ['PENDING','IN_PROGRESS','COMPLETED','EXPIRED','OVERDUE','EXEMPT'];

function parseRow(row: Record<string, string>): {
  ok: true;
  data: Parameters<typeof prisma.trainingRecord.create>[0]['data'];
} | { ok: false; error: string } {
  const staffName   = row['staffName']?.trim()   || row['staff_name']?.trim()   || row['Staff Name']?.trim();
  const trainingName = row['trainingName']?.trim() || row['training_name']?.trim() || row['Training Name']?.trim();
  const categoryRaw  = (row['category']?.trim()    || row['Category']?.trim() || '').toUpperCase().replace(/[ -]/g, '_');

  if (!staffName)    return { ok: false, error: 'Missing staffName' };
  if (!trainingName) return { ok: false, error: 'Missing trainingName' };

  const category = VALID_CATEGORIES.includes(categoryRaw) ? categoryRaw : 'OTHER';
  const statusRaw = (row['status']?.trim() || row['Status']?.trim() || 'COMPLETED').toUpperCase().replace(/ /g, '_');
  const status = VALID_STATUSES.includes(statusRaw) ? statusRaw : 'COMPLETED';

  const completedDateStr = row['completedDate'] || row['completed_date'] || row['Completed Date'] || '';
  const expiryDateStr    = row['expiryDate']    || row['expiry_date']    || row['Expiry Date']    || row['Expiration Date'] || '';
  const completedDate = completedDateStr ? new Date(completedDateStr) : null;
  const expiryDate    = expiryDateStr    ? new Date(expiryDateStr)    : null;

  if (completedDate && isNaN(completedDate.getTime())) return { ok: false, error: `Invalid completedDate: ${completedDateStr}` };
  if (expiryDate    && isNaN(expiryDate.getTime()))    return { ok: false, error: `Invalid expiryDate: ${expiryDateStr}` };

  const scoreStr       = row['score']?.trim()        || row['Score']?.trim()        || '';
  const passingStr     = row['passingScore']?.trim()  || row['passing_score']?.trim() || '';
  const score          = scoreStr ? Number(scoreStr) : null;
  const passingScore   = passingStr ? Number(passingStr) : null;
  const isRequiredRaw  = row['isRequired']?.trim()   || row['is_required']?.trim()   || row['Required']?.trim() || 'true';
  const isRequired     = !['false','no','0'].includes(isRequiredRaw.toLowerCase());

  return {
    ok: true,
    data: {
      staffName,
      staffId:      row['staffId']?.trim()    || row['staff_id']?.trim()    || null,
      department:   row['department']?.trim() || row['Department']?.trim() || null,
      jobTitle:     row['jobTitle']?.trim()   || row['job_title']?.trim()   || row['Job Title']?.trim() || null,
      trainingName,
      category: category as never,
      status:   status   as never,
      completedDate,
      expiryDate,
      isRequired,
      score:        score && !isNaN(score) ? score : null,
      passingScore: passingScore && !isNaN(passingScore) ? passingScore : null,
      provider:     row['provider']?.trim()  || row['Provider']?.trim()  || null,
      notes:        row['notes']?.trim()     || row['Notes']?.trim()     || null,
      regulatoryBody: null,
      facilityId:   '', // filled per-record below
    },
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { rows: Record<string, string>[] };
  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided.' }, { status: 400 });
  }
  if (body.rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 rows per import.' }, { status: 400 });
  }

  const facilityId = session.user.facilityId;
  const results: { index: number; ok: boolean; id?: string; error?: string }[] = [];

  for (let i = 0; i < body.rows.length; i++) {
    const parsed = parseRow(body.rows[i]);
    if (!parsed.ok) {
      results.push({ index: i, ok: false, error: parsed.error });
      continue;
    }
    try {
      const record = await prisma.trainingRecord.create({
        data: { ...parsed.data, facilityId },
      });
      results.push({ index: i, ok: true, id: record.id });
    } catch (err) {
      results.push({ index: i, ok: false, error: err instanceof Error ? err.message : 'DB error' });
    }
  }

  const created = results.filter(r => r.ok).length;
  const failed  = results.filter(r => !r.ok).length;

  if (created > 0) {
    await logAudit({
      userId: session.user.id,
      action: 'BULK_IMPORT_TRAINING',
      entityType: 'TrainingRecord',
      entityId: 'bulk',
      changes: { created, failed, total: body.rows.length },
      req,
    });
  }

  return NextResponse.json({ created, failed, results });
}
