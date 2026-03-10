import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Activity } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const HAI_LABELS: Record<string, string> = {
  CAUTI: 'CAUTI (Catheter-Associated UTI)',
  CLABSI: 'CLABSI (Central Line BSI)',
  SSI: 'SSI (Surgical Site Infection)',
  MRSA_BSI: 'MRSA Bacteremia',
  CDI: 'C. diff Infection',
  VAP: 'Ventilator-Associated Pneumonia',
  HAP: 'Hospital-Acquired Pneumonia',
  SSI_COLON: 'Colon Surgical Site Infection',
  OTHER: 'Other HAI',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}

export default async function HaiDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const hai = await prisma.haiSurveillance.findUnique({ where: { id: params.id } });

  if (!hai || hai.facilityId !== session.user.facilityId) notFound();

  const aboveBenchmark = hai.sir != null && hai.nhsnBenchmark != null && hai.sir > hai.nhsnBenchmark;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/infection-control/hai" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to HAI Surveillance
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{HAI_LABELS[hai.haiType] ?? hai.haiType}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {MONTHS[hai.reportMonth]} {hai.reportYear}
              &middot; <strong>{hai.caseCount} case{hai.caseCount !== 1 ? 's' : ''}</strong>
            </p>
          </div>
        </div>
      </div>

      {aboveBenchmark && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-800">SIR Above NHSN Benchmark — Review required and consider QAPI project.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Surveillance Data">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-400">Case Count</dt>
              <dd className="text-2xl font-bold text-slate-800 mt-0.5">{hai.caseCount}</dd>
            </div>
            {hai.patientDays != null && (
              <div>
                <dt className="text-xs text-slate-400">Patient Days</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{hai.patientDays.toLocaleString()}</dd>
              </div>
            )}
            {hai.rate != null && (
              <div>
                <dt className="text-xs text-slate-400">Rate (per 1,000 pt-days)</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{hai.rate.toFixed(2)}</dd>
              </div>
            )}
          </dl>
        </Section>

        <Section title="Benchmarking">
          <dl className="space-y-3">
            {hai.nhsnBenchmark != null && (
              <div>
                <dt className="text-xs text-slate-400">NHSN SIR Benchmark</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{hai.nhsnBenchmark.toFixed(2)}</dd>
              </div>
            )}
            {hai.sir != null && (
              <div>
                <dt className="text-xs text-slate-400">Standardized Infection Ratio (SIR)</dt>
                <dd className={`text-sm font-bold mt-0.5 ${aboveBenchmark ? 'text-red-600' : 'text-green-600'}`}>
                  {hai.sir.toFixed(2)} {aboveBenchmark ? '▲ Above' : '▼ Below'} benchmark
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-400">Submitted to NHSN</dt>
              <dd className={`text-sm font-semibold mt-0.5 ${hai.submittedToNhsn ? 'text-green-600' : 'text-yellow-600'}`}>
                {hai.submittedToNhsn ? 'Yes' : 'Pending'}
              </dd>
            </div>
          </dl>
        </Section>
      </div>

      {hai.notes && (
        <Section title="Notes">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{hai.notes}</p>
        </Section>
      )}
    </div>
  );
}
