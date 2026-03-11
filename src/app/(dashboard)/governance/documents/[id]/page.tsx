import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileText , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SUPERSEDED: 'bg-orange-100 text-orange-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
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

export default async function GovernanceDocDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const doc = await prisma.governanceDocument.findUnique({ where: { id: params.id } });

  if (!doc || doc.facilityId !== session.user.facilityId) notFound();

  const reviewDue = doc.reviewDate && new Date(doc.reviewDate) < new Date();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/governance/documents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Governance Documents
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/governance/documents/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/governance/documents/${params.id}`} redirectPath="/governance/documents" label="governance document" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-slate-400">{doc.docType.replace(/_/g, ' ')}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[doc.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {doc.status.replace(/_/g, ' ')}
              </span>
              {reviewDue && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Review Overdue</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{doc.title}</h1>
            {doc.version && <p className="text-sm text-slate-400 mt-0.5">Version {doc.version}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Document Details">
          <dl className="space-y-3">
            <Field label="Document Type" value={doc.docType.replace(/_/g, ' ')} />
            <Field label="Title" value={doc.title} />
            {doc.version && <Field label="Version" value={doc.version} />}
            <Field label="Effective Date" value={formatDate(doc.effectiveDate)} />
            {doc.reviewDate && <Field label="Review Date" value={formatDate(doc.reviewDate)} />}
            {doc.approvedBy && <Field label="Approved By" value={doc.approvedBy} />}
          </dl>
        </Section>

        <Section title="Status & Document">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-400">Status</dt>
              <dd className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold mt-1 ${STATUS_COLOR[doc.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {doc.status.replace(/_/g, ' ')}
              </dd>
            </div>
          </dl>
          {doc.documentUrl && (
            <div className="mt-4">
              <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                <FileText className="w-4 h-4" /> View Document
              </a>
            </div>
          )}
        </Section>
      </div>

      {doc.notes && (
        <Section title="Notes">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{doc.notes}</p>
        </Section>
      )}
    </div>
  );
}
