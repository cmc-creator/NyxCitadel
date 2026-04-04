import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Target, ArrowLeft, Calendar, User, AlertTriangle,
  CheckCircle2, Clock, Activity, FileText, Users, Pencil,
} from 'lucide-react';
import { isPast } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'QAPI Project Detail' };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     'bg-blue-950/20 text-blue-700',
  MONITORING: 'bg-purple-50 text-purple-700',
  COMPLETED:  'bg-green-50 text-green-700',
  SUSPENDED:  'bg-yellow-50 text-yellow-700',
  CANCELLED:  'bg-slate-100 text-slate-500',
};

const CATEGORY_COLORS: Record<string, string> = {
  PATIENT_SAFETY:       'bg-red-100 text-red-700',
  RESTRAINT_SECLUSION:  'bg-orange-100 text-orange-700',
  MEDICATION_SAFETY:    'bg-yellow-100 text-yellow-700',
  CLINICAL_CARE:        'bg-blue-100 text-blue-700',
  INFECTION_PREVENTION: 'bg-teal-100 text-teal-700',
  PATIENT_EXPERIENCE:   'bg-green-100 text-green-700',
  STAFF_SAFETY:         'bg-purple-100 text-purple-700',
  READMISSIONS:         'bg-indigo-100 text-indigo-700',
  COMPLIANCE:           'bg-teal-100 text-teal-700',
  WORKFORCE:            'bg-pink-100 text-pink-700',
  THROUGHPUT:           'bg-cyan-100 text-cyan-700',
  OTHER:                'bg-slate-100 text-slate-600',
};

export default async function QapiProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const p = await prisma.qapiProject.findFirst({
    where: { id: params.id, facilityId },
  });
  if (!p) notFound();

  const isOverdue = !['COMPLETED', 'CANCELLED'].includes(p.status) && isPast(p.targetDate);
  const hasProgress = p.baselineValue !== null && p.targetValue !== null;
  const progressPct = hasProgress && p.targetValue !== 0
    ? Math.min(100, Math.round(((p.baselineValue ?? 0) / p.targetValue!) * 100))
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div>
        <Link href="/quality/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground/80 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to QAPI Projects
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Target className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{p.title}</h1>
                <span className="text-sm font-mono text-muted-foreground/70">{p.projectNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/quality/projects/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[p.category] ?? 'bg-slate-100 text-slate-600'}`}>
              {p.category.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-500'}`}>
              {p.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          CMS 42 CFR 482.21 · Performance Improvement Project
          {p.regulatoryBody && ` · ${p.regulatoryBody.replace(/_/g, ' ')}`}
          {p.standardRef && ` · ${p.standardRef}`}
        </p>
      </div>

      {/* Alerts */}
      {isOverdue && (
        <div className="bg-orange-950/20 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-700">Target Date Overdue</p>
            <p className="text-xs text-orange-600">Target was {formatDate(p.targetDate)}. Update status or extend the target date.</p>
          </div>
        </div>
      )}
      {p.status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            Project Completed{p.completedDate ? ` · ${formatDate(p.completedDate)}` : ''}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key info panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Project Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</dt>
                <dd className="text-foreground font-medium mt-0.5">{formatDate(p.startDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Target Date
                </dt>
                <dd className={`font-medium mt-0.5 ${isOverdue ? 'text-orange-600' : 'text-foreground'}`}>
                  {formatDate(p.targetDate)}
                </dd>
              </div>
              {p.completedDate && (
                <div>
                  <dt className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Completed</dt>
                  <dd className="text-green-700 font-medium mt-0.5">{formatDate(p.completedDate)}</dd>
                </div>
              )}
              {p.owner && (
                <div>
                  <dt className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Owner</dt>
                  <dd className="text-foreground mt-0.5">{p.owner}</dd>
                </div>
              )}
              {p.team && (
                <div>
                  <dt className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> Team</dt>
                  <dd className="text-foreground/80 text-xs mt-0.5 whitespace-pre-wrap">{p.team}</dd>
                </div>
              )}
              {p.relatedMetricKey && (
                <div>
                  <dt className="text-xs text-slate-500 flex items-center gap-1"><Activity className="w-3 h-3" /> Metric Key</dt>
                  <dd className="font-mono text-xs text-slate-600 mt-0.5">{p.relatedMetricKey}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Metrics */}
          {hasProgress && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Metrics</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Baseline</dt>
                  <dd className="text-2xl font-bold text-foreground mt-0.5">
                    {p.baselineValue}{p.targetUnit ?? ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Goal</dt>
                  <dd className="text-2xl font-bold text-purple-700 mt-0.5">
                    {p.targetValue}{p.targetUnit ?? ''}
                  </dd>
                </div>
                {p.measure && (
                  <div>
                    <dt className="text-xs text-slate-500">Measure</dt>
                    <dd className="text-xs text-slate-600 mt-0.5">{p.measure}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground/70" /> Problem & Aim
            </h2>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Problem Statement</p>
              <p className="text-sm text-foreground/80 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{p.problemStatement}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Project Aim</p>
              <p className="text-sm text-foreground/80 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{p.aim}</p>
            </div>
          </div>

          {p.interventions && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground/80 mb-2">Interventions</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{p.interventions}</p>
            </div>
          )}

          {p.outcome && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground/80 mb-2">Outcomes</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{p.outcome}</p>
            </div>
          )}

          {p.sustainPlan && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-5">
              <h2 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Sustainability Plan
              </h2>
              <p className="text-sm text-green-700 whitespace-pre-wrap">{p.sustainPlan}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/quality/projects/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100"
        >
          + New QAPI Project
        </Link>
        <Link
          href="/quality/metrics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-card border border-border px-3 py-2 rounded-lg hover:bg-slate-50"
        >
          <Activity className="w-3.5 h-3.5" /> View Metrics
        </Link>
      </div>
    </div>
  );
}
