import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ChevronLeft,
  Calendar,
  Code,
  Clock,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Template ${params.id.slice(0, 8).toUpperCase()}` };
}

const CATEGORY_STYLES: Record<string, string> = {
  PATIENT_GRIEVANCE_ACKNOWLEDGMENT: 'bg-orange-100 text-orange-800',
  PATIENT_GRIEVANCE_RESOLUTION:     'bg-orange-100 text-orange-800',
  PLAN_OF_CORRECTION:               'bg-red-100 text-red-800',
  SENTINEL_EVENT_FAMILY_NOTICE:     'bg-red-100 text-red-800',
  STATE_ADVERSE_EVENT_REPORT:       'bg-red-100 text-red-800',
  JC_SENTINEL_EVENT_REPORT:         'bg-purple-100 text-purple-800',
  SURVEY_RESPONSE_COVER:            'bg-blue-100 text-blue-800',
  CAP_COMPLETION_NOTICE:            'bg-emerald-100 text-emerald-800',
  INCIDENT_FAMILY_NOTIFICATION:     'bg-yellow-100 text-yellow-800',
  REGULATORY_INQUIRY_RESPONSE:      'bg-indigo-100 text-indigo-800',
  COMPLAINT_ACKNOWLEDGMENT:         'bg-muted/30 text-foreground/80',
};

export default async function ResponseTemplateDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const template = await prisma.responseTemplate.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
    include: {
      _count: { select: { responses: true } },
    },
  });
  if (!template) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/quality/response-templates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to Templates
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            {template.name}
          </h1>
          {template.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/quality/response-templates/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${CATEGORY_STYLES[template.category] ?? 'bg-muted/30 text-foreground/80'}`}>
            {template.category.replace(/_/g, ' ')}
          </span>
          {!template.isActive && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted/30 text-muted-foreground">Inactive</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Details</h2>
            <dl className="space-y-3">
              {template.regulatoryRef && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Regulatory Reference</dt>
                  <dd className="text-sm font-mono text-foreground">{template.regulatoryRef}</dd>
                </div>
              )}
              {template.daysRequired && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Response Deadline</dt>
                  <dd className="text-sm text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> {template.daysRequired} days
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Times Used</dt>
                <dd className="text-sm text-foreground">{template._count.responses} responses</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">System Default</dt>
                <dd className="text-sm">{template.isDefault
                  ? <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                  : <span className="text-muted-foreground/70">No (custom)</span>}
                </dd>
              </div>
            </dl>
          </div>

          {template.variables.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-muted-foreground/70" /> Template Variables
              </h2>
              <div className="flex flex-wrap gap-2">
                {(template.variables as string[]).map((v) => (
                  <code key={v} className="text-xs bg-muted/30 text-foreground/80 px-2 py-1 rounded font-mono">{v}</code>
                ))}
              </div>
            </div>
          )}

          {template.instructions && (
            <div className="bg-amber-950/20 rounded-xl border border-amber-200 p-5">
              <h2 className="text-sm font-semibold text-amber-800 mb-2">Usage Instructions</h2>
              <p className="text-xs text-amber-700 whitespace-pre-wrap leading-relaxed">{template.instructions}</p>
            </div>
          )}

          <Link
            href={`/quality/responses/new?templateId=${template.id}`}
            className="flex items-center justify-center gap-1.5 text-xs font-medium bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Use This Template
          </Link>
        </div>

        {/* Right: Body */}
        <div className="lg:col-span-2 space-y-4">
          {template.subject && (
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Default Subject</p>
              <p className="text-base font-semibold text-foreground">{template.subject}</p>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Template Body</h3>
            <pre className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-mono bg-muted/30 rounded-lg p-4 overflow-x-auto">
              {template.bodyTemplate}
            </pre>
          </div>

          <div className="bg-muted/30 rounded-xl border border-border px-5 py-3 flex items-center justify-between text-xs text-muted-foreground/70">
            <span>Created {formatDate(template.createdAt)}</span>
            <span>Last updated {formatDate(template.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
