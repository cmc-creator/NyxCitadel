import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  ChevronLeft,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Response ${params.id.slice(0, 8).toUpperCase()}` };
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT:        'bg-slate-100 text-foreground/80',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED:     'bg-blue-100 text-blue-800',
  SENT:         'bg-emerald-100 text-emerald-800',
  FILED:        'bg-purple-100 text-purple-800',
};

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default async function ResponseDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const response = await prisma.generatedResponse.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
    include: { template: { select: { id: true, name: true, category: true, regulatoryRef: true } } },
  });
  if (!response) notFound();

  const isOverdue = response.dueDate && response.status !== 'SENT' && response.status !== 'FILED' && new Date() > response.dueDate;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/quality/responses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to Responses
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-purple-600" />
            {response.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {response.category.replace(/_/g, ' ')}
            {response.aiGenerated && <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-teal-600"><Sparkles className="w-3 h-3" /> AI Generated</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/quality/responses/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <span className={`text-xs font-medium px-3 py-1 rounded-full self-start ${STATUS_STYLES[response.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {response.status}
          </span>
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <strong>Overdue:</strong> This response was due {formatDate(response.dueDate!)} and has not been sent.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground/70" /> Recipient
            </h2>
            <dl className="space-y-3">
              <Field label="Name"    value={response.recipientName} />
              <Field label="Role"    value={response.recipientRole} />
              <Field label="Address" value={response.recipientAddress} />
            </dl>
            {!response.recipientName && <p className="text-xs text-muted-foreground/70 italic">No recipient specified</p>}
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground/70" /> Tracking
            </h2>
            <dl className="space-y-3">
              {response.dueDate && <Field label="Due Date"  value={formatDate(response.dueDate)} />}
              {response.sentDate && <Field label="Sent Date" value={formatDate(response.sentDate)} />}
              {response.sentBy   && <Field label="Sent By"   value={response.sentBy} />}
              {response.reviewedBy && <Field label="Reviewed By" value={response.reviewedBy} />}
              {response.draftedBy  && <Field label="Drafted By"  value={response.draftedBy} />}
            </dl>
          </div>

          {response.sourceRef && (
            <div className="bg-slate-50 rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Source Reference</p>
              <p className="text-sm text-foreground font-medium">{response.sourceType?.replace(/_/g, ' ')} – {response.sourceRef}</p>
            </div>
          )}

          {response.template && (
            <div className="bg-slate-50 rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Template Used</p>
              <Link href={`/quality/response-templates/${response.template.id}`} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                {response.template.name}
              </Link>
              {response.template.regulatoryRef && <p className="text-xs text-muted-foreground/70 mt-0.5">{response.template.regulatoryRef}</p>}
            </div>
          )}
        </div>

        {/* Right: Letter body */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Subject</p>
            <p className="text-base font-semibold text-foreground mb-4">{response.subject}</p>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-mono">{response.body}</p>
            </div>
          </div>

          {response.notes && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Internal Notes</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{response.notes}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl border border-border px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Created {formatDate(response.createdAt)}</span>
            <span>Last updated {formatDate(response.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
