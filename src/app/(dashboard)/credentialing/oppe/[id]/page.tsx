import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, BarChart3 , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const RATING_COLOR: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-800',
  ACCEPTABLE: 'bg-blue-100 text-blue-800',
  NEEDS_IMPROVEMENT: 'bg-yellow-100 text-yellow-800',
  UNSATISFACTORY: 'bg-red-100 text-red-800',
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

export default async function OppeDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const oppe = await prisma.oppeRecord.findUnique({
    where: { id: params.id },
    include: {
      provider: { select: { id: true, firstName: true, lastName: true, credentials: true, specialty: true, facilityId: true } },
    },
  });

  if (!oppe || oppe.provider.facilityId !== session.user.facilityId) notFound();

  const metrics = (oppe.metrics ?? []) as Array<{ metric: string; numerator: number; denominator: number; rate: number; benchmark?: number }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/credentialing/oppe" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to OPPE Records
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/credentialing/oppe/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-slate-400 font-mono">{oppe.reviewCycle}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${RATING_COLOR[oppe.overallRating] ?? 'bg-slate-100 text-slate-600'}`}>
                {oppe.overallRating.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              OPPE - {oppe.provider.firstName} {oppe.provider.lastName}, {oppe.provider.credentials}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {oppe.provider.specialty} &middot; {formatDate(oppe.periodStart)} – {formatDate(oppe.periodEnd)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {metrics.length > 0 && (
            <Section title="Performance Metrics">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-xs font-semibold text-slate-500">Metric</th>
                      <th className="text-right py-2 text-xs font-semibold text-slate-500">Numerator</th>
                      <th className="text-right py-2 text-xs font-semibold text-slate-500">Denominator</th>
                      <th className="text-right py-2 text-xs font-semibold text-slate-500">Rate</th>
                      <th className="text-right py-2 text-xs font-semibold text-slate-500">Benchmark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 text-slate-700 font-medium">{m.metric}</td>
                        <td className="py-2 text-right text-slate-600">{m.numerator}</td>
                        <td className="py-2 text-right text-slate-600">{m.denominator}</td>
                        <td className="py-2 text-right text-slate-600">{m.rate?.toFixed(1)}%</td>
                        <td className="py-2 text-right text-slate-400">{m.benchmark != null ? `${m.benchmark}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {oppe.notes && (
            <Section title="Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{oppe.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Review Summary">
            <dl className="space-y-3">
              <Field label="Review Cycle" value={oppe.reviewCycle} />
              <Field label="Period" value={`${formatDate(oppe.periodStart)} – ${formatDate(oppe.periodEnd)}`} />
              <div>
                <dt className="text-xs text-slate-400">Total Cases</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{oppe.totalCases}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Compliant Cases</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">{oppe.compliantCases}</dd>
              </div>
              <Field label="Overall Rating" value={oppe.overallRating.replace(/_/g, ' ')} />
              {oppe.reviewedBy && <Field label="Reviewed By" value={oppe.reviewedBy} />}
              <div>
                <dt className="text-xs text-slate-400">MEC Approved</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${oppe.approvedByMec ? 'text-green-600' : 'text-slate-500'}`}>
                  {oppe.approvedByMec ? 'Yes' : 'Pending'}
                </dd>
              </div>
            </dl>
          </Section>

          <Section title="Provider">
            <Link href={`/credentialing/providers/${oppe.provider.id}`} className="text-sm text-indigo-600 hover:underline">
              {oppe.provider.firstName} {oppe.provider.lastName}, {oppe.provider.credentials} →
            </Link>
          </Section>
        </div>
      </div>
    </div>
  );
}
