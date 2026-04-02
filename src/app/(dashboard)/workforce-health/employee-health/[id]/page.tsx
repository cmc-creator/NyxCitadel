import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, HeartPulse , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

function BoolField({ label, value, yesColor = 'text-green-600', noColor = 'text-muted-foreground/70' }: {
  label: string; value: boolean; yesColor?: string; noColor?: string
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className={`text-sm font-semibold mt-0.5 ${value ? yesColor : noColor}`}>{value ? 'Yes' : 'No'}</dd>
    </div>
  );
}

export default async function EmployeeHealthDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const record = await prisma.employeeHealthRecord.findUnique({ where: { id: params.id } });

  if (!record || record.facilityId !== session.user.facilityId) notFound();

  const tbDue = record.tbNextDueDate && new Date(record.tbNextDueDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/workforce-health/employee-health" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Employee Health
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/workforce-health/employee-health/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start gap-3">
          <HeartPulse className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{record.employeeName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {record.department}
              {record.employeeId && <> &middot; ID: <strong>{record.employeeId}</strong></>}
              {record.hireDate && <> &middot; Hire Date: <strong>{formatDate(record.hireDate)}</strong></>}
            </p>
          </div>
        </div>
      </div>

      {tbDue && (
        <div className="bg-orange-950/20 border border-orange-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-800">TB Screening Overdue - Last due: {record.tbNextDueDate ? formatDate(record.tbNextDueDate) : 'Unknown'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="TB Screening">
          <dl className="space-y-3">
            {record.tbScreenDate && <Field label="Last Screened" value={formatDate(record.tbScreenDate)} />}
            <Field label="Method" value={record.tbMethod} />
            <Field label="Result" value={record.tbResult} />
            {record.tbNextDueDate && (
              <div>
                <dt className="text-xs text-muted-foreground/70">Next Due</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${tbDue ? 'text-red-600' : 'text-foreground'}`}>
                  {formatDate(record.tbNextDueDate)}
                </dd>
              </div>
            )}
          </dl>
        </Section>

        <Section title="Flu Vaccine">
          <dl className="space-y-3">
            {record.fluVaxDate && <Field label="Vaccination Date" value={formatDate(record.fluVaxDate)} />}
            <Field label="Season" value={record.fluVaxSeason} />
            {record.fluVaxDeclined && (
              <>
                <div>
                  <dt className="text-xs text-muted-foreground/70">Declined</dt>
                  <dd className="text-sm font-semibold text-yellow-600 mt-0.5">Yes - Declined</dd>
                </div>
                <Field label="Decline Reason" value={record.fluDeclineReason} />
              </>
            )}
          </dl>
        </Section>

        <Section title="Other Clearances">
          <dl className="space-y-3">
            <Field label="COVID Vaccination Status" value={record.covidVaxStatus} />
            {record.bgCheckDate && <Field label="Background Check Date" value={formatDate(record.bgCheckDate)} />}
            <BoolField label="License Verified" value={record.licenseVerified} />
          </dl>
        </Section>

        <Section title="N95 Fit Test">
          <dl className="space-y-3">
            {record.fitTestDate && <Field label="Fit Test Date" value={formatDate(record.fitTestDate)} />}
            <Field label="Result" value={record.fitTestResult} />
            <Field label="Respirator Model" value={record.fitTestModel} />
          </dl>
        </Section>
      </div>

      {record.notes && (
        <Section title="Notes">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{record.notes}</p>
        </Section>
      )}
    </div>
  );
}
