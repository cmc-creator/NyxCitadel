import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileHeart , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

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

function BoolField({ label, value, yesColor = 'text-green-600', noColor = 'text-red-600' }: {
  label: string; value: boolean; yesColor?: string; noColor?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className={`text-sm font-semibold mt-0.5 ${value ? yesColor : noColor}`}>{value ? 'Yes' : 'No'}</dd>
    </div>
  );
}

export default async function AdvanceDirectiveDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const ad = await prisma.advanceDirectiveRecord.findUnique({ where: { id: params.id } });

  if (!ad || ad.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/patient-rights/advance-directives" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Advance Directives
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/patient-rights/advance-directives/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/patient-rights/advance-directives/${params.id}`} redirectPath="/patient-rights/advance-directives" label="advance directive" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <FileHeart className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Patient {ad.patientInitials}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Admit: <strong>{formatDate(ad.admitDate)}</strong>
              {ad.patientMrn && <> &middot; MRN: <strong>{ad.patientMrn}</strong></>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Advance Directive Status">
          <dl className="space-y-3">
            <BoolField label="Patient Has Advance Directive" value={ad.adExists}
              yesColor="text-green-600" noColor="text-slate-500" />
            {ad.adType && <Field label="AD Type" value={ad.adType} />}
            <BoolField label="Copy On File" value={ad.adOnFile}
              yesColor="text-green-600" noColor="text-yellow-600" />
          </dl>
        </Section>

        <Section title="Documentation">
          <dl className="space-y-3">
            <BoolField label="Information Provided to Patient" value={ad.informationProvided} />
            {ad.providedBy && <Field label="Provided By" value={ad.providedBy} />}
            <BoolField label="Patient Declined Information" value={ad.patientDeclined}
              yesColor="text-yellow-600" noColor="text-green-600" />
            <Field label="Documented By" value={ad.documentedBy} />
            <Field label="Documented Date" value={formatDate(ad.documentedDate)} />
          </dl>
        </Section>
      </div>

      {ad.notes && (
        <Section title="Notes">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{ad.notes}</p>
        </Section>
      )}
    </div>
  );
}
