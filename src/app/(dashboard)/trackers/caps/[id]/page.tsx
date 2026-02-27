import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ClipboardList, ArrowLeft, AlertTriangle, CheckCircle2, Clock, ShieldCheck, RefreshCw, Target } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isPast } from 'date-fns';

export const metadata = { title: 'Corrective Action Plan' };

const STATUS_COLOR: Record<string, string> = {
  OPEN:        'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED:   'bg-green-100 text-green-800',
  VERIFIED:    'bg-teal-100 text-teal-800',
  OVERDUE:     'bg-red-100 text-red-800',
  EXTENDED:    'bg-orange-100 text-orange-800',
};

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH:     'bg-orange-100 text-orange-800',
  MEDIUM:   'bg-yellow-100 text-yellow-800',
  LOW:      'bg-slate-100 text-slate-600',
};

const VIGILANCE_STATUS_COLOR: Record<string, string> = {
  PENDING:  'bg-slate-100 text-slate-600',
  ACTIVE:   'bg-blue-100 text-blue-700',
  BREACH:   'bg-red-100 text-red-700',
  COMPLETE: 'bg-green-100 text-green-700',
};

export default async function CapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const cap = await prisma.correctiveActionPlan.findFirst({
    where: { id: params.id, facilityId },
    include: {
      assignee: { select: { name: true, email: true } },
      incidents: { select: { id: true, incidentType: true, dateOccurred: true, severity: true } },
      surveys:   { select: { id: true, surveyType: true, conductedDate: true, regulatoryBody: true } },
    },
  });

  if (!cap) notFound();

  const isOverdue = isPast(cap.targetDate) && !['COMPLETED', 'VERIFIED'].includes(cap.status);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/trackers/caps" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CAPs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-slate-500">{cap.capNumber}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[cap.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {cap.status.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${PRIORITY_COLOR[cap.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                {cap.priority} PRIORITY
              </span>
              {cap.isPdsa && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  PDSA Cycle
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{cap.title}</h1>
            {cap.regulatoryBody && (
              <p className="text-sm text-slate-500 mt-0.5">{cap.regulatoryBody.replace(/_/g, ' ')} · Source: {cap.source.replace(/_/g, ' ')}{cap.sourceRef ? ` · ${cap.sourceRef}` : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue alert */}
      {isOverdue && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>This CAP is <strong>overdue</strong> — target date was {formatDate(cap.targetDate)}.</span>
        </div>
      )}

      {/* Key facts */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Information</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-xs text-slate-400">Target Date</dt><dd className="text-slate-800 font-medium">{formatDate(cap.targetDate)}</dd></div>
            {cap.completedDate && <div><dt className="text-xs text-slate-400">Completed Date</dt><dd className="text-slate-800">{formatDate(cap.completedDate)}</dd></div>}
            <div><dt className="text-xs text-slate-400">Assignee</dt><dd className="text-slate-800">{cap.assignee?.name ?? cap.assignee?.email ?? 'Unassigned'}</dd></div>
            <div><dt className="text-xs text-slate-400">Created</dt><dd className="text-slate-800">{formatDate(cap.createdAt)}</dd></div>
            {cap.followUpDate && <div><dt className="text-xs text-slate-400">Follow-up Date</dt><dd className="text-slate-800">{formatDate(cap.followUpDate)}</dd></div>}
            {cap.vigilanceDays && <div><dt className="text-xs text-slate-400">Vigilance Period</dt><dd className="text-slate-800">{cap.vigilanceDays} days</dd></div>}
            {cap.vigilanceStatus && (
              <div>
                <dt className="text-xs text-slate-400">Vigilance Status</dt>
                <dd>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${VIGILANCE_STATUS_COLOR[cap.vigilanceStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                    {cap.vigilanceStatus}
                  </span>
                  {(cap.vigilanceBreaches ?? 0) > 0 && (
                    <span className="ml-2 text-xs text-red-600 font-semibold">{cap.vigilanceBreaches} breach{cap.vigilanceBreaches !== 1 ? 'es' : ''}</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Description & Plan */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-5 py-4 space-y-1">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Problem Description</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.description}</p>
        </div>
        {cap.rootCause && (
          <div className="px-5 py-4 space-y-1">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Root Cause</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.rootCause}</p>
          </div>
        )}
        <div className="px-5 py-4 space-y-1">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correction Plan</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.correctionPlan}</p>
        </div>
        {cap.measureOfSuccess && (
          <div className="px-5 py-4 space-y-1">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="inline-flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Measure of Success</span>
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.measureOfSuccess}</p>
          </div>
        )}
        {cap.followUpNotes && (
          <div className="px-5 py-4 space-y-1">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Follow-up Notes</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.followUpNotes}</p>
          </div>
        )}
      </div>

      {/* PDSA Cycle */}
      {cap.isPdsa && (
        <div className="bg-white rounded-xl border border-purple-200 divide-y divide-purple-100">
          <div className="px-5 py-4 flex items-center gap-2 bg-purple-50 rounded-t-xl">
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-purple-800">PDSA Quality Improvement Cycle</h2>
          </div>
          {[
            { key: 'pdsaPlan', label: 'Plan', desc: 'Problem statement and planned intervention', value: cap.pdsaPlan },
            { key: 'pdsaDo',   label: 'Do',   desc: 'Execution notes — what was actually done',  value: cap.pdsaDo   },
            { key: 'pdsaStudy',label: 'Study',desc: 'Results, metrics, observations',             value: cap.pdsaStudy },
            { key: 'pdsaAct',  label: 'Act',  desc: 'Standardize, adjust, or restart cycle',     value: cap.pdsaAct  },
          ].map(step => (
            <div key={step.key} className="px-5 py-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-purple-700 w-12">{step.label}</span>
                <span className="text-xs text-slate-400">{step.desc}</span>
              </div>
              {step.value ? (
                <p className="text-sm text-slate-700 whitespace-pre-wrap ml-14">{step.value}</p>
              ) : (
                <p className="text-xs text-slate-400 italic ml-14">Not yet completed</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Linked Sources */}
      {(cap.incidents.length > 0 || cap.surveys.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Linked Records</h2>
          <div className="space-y-2">
            {cap.incidents.map(inc => (
              <div key={inc.id} className="flex items-center gap-3 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-slate-700">{inc.incidentType.replace(/_/g, ' ')} on {formatDate(inc.dateOccurred)}</span>
                <span className="text-xs text-slate-400">{inc.severity}</span>
              </div>
            ))}
            {cap.surveys.map(s => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-700">{s.surveyType.replace(/_/g, ' ')} — {s.regulatoryBody.replace(/_/g, ' ')}</span>
                {s.conductedDate && <span className="text-xs text-slate-400">{formatDate(s.conductedDate)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {!['COMPLETED','VERIFIED'].includes(cap.status) && (
          <Link href={`/trackers/caps/${cap.id}/edit`} className="btn-secondary text-sm">
            Edit CAP
          </Link>
        )}
        {cap.status === 'COMPLETED' && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Completed — pending verification
          </span>
        )}
        {cap.status === 'VERIFIED' && (
          <span className="inline-flex items-center gap-1.5 text-sm text-teal-700 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Verified &amp; Closed
          </span>
        )}
        {cap.isPdsa && (
          <Link href="/quality/projects" className="btn-secondary text-sm">
            View PDSA Projects →
          </Link>
        )}
      </div>
    </div>
  );
}
