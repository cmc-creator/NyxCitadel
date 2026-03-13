import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Pencil, ShieldAlert } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const RISK_COLOR: Record<string, string> = {
  IMMEDIATE: 'bg-red-100 text-red-800 border border-red-300',
  HIGH:      'bg-orange-100 text-orange-800 border border-orange-300',
  MEDIUM:    'bg-amber-100 text-amber-800 border border-amber-300',
  LOW:       'bg-slate-100 text-slate-600 border border-slate-300',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN:          'bg-red-100 text-red-800',
  IN_MITIGATION: 'bg-amber-100 text-amber-800',
  MITIGATED:     'bg-sky-100 text-sky-800',
  RESOLVED:      'bg-emerald-100 text-emerald-800',
  ACCEPTED_RISK: 'bg-slate-100 text-slate-600',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
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

export default async function LigatureItemDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const item = await prisma.ligatureRiskItem.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });

  if (!item) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/eoc/ligature" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Ligature Risk
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/eoc/ligature/${params.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton
            apiPath={`/api/eoc/ligature/${params.id}`}
            redirectPath="/eoc/ligature"
            label="ligature item"
          />
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span className="font-mono text-xs text-slate-400">{item.itemNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_COLOR[item.riskLevel] ?? 'bg-slate-100 text-slate-600'}`}>
                {item.riskLevel}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {item.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{item.itemDescription}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {item.location}{item.unit && ` · ${item.unit}`}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {item.mitigationPlan && (
            <Section title="Mitigation Plan">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.mitigationPlan}</p>
            </Section>
          )}
          {item.notes && (
            <Section title="Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Item Details">
            <dl className="space-y-3">
              <Field label="Item Number" value={item.itemNumber} />
              <Field label="Risk Level" value={item.riskLevel} />
              <Field label="Status" value={item.status.replace(/_/g, ' ')} />
              <Field label="Location" value={item.location} />
              {item.unit && <Field label="Unit" value={item.unit} />}
              <Field label="Identified" value={formatDate(item.identifiedDate)} />
              <Field label="Identified By" value={item.identifiedBy} />
              {item.targetDate && <Field label="Target Date" value={formatDate(item.targetDate)} />}
              {item.resolvedDate && <Field label="Resolved Date" value={formatDate(item.resolvedDate)} />}
              {item.resolvedBy && <Field label="Resolved By" value={item.resolvedBy} />}
              {item.verifiedBy && <Field label="Verified By" value={item.verifiedBy} />}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
