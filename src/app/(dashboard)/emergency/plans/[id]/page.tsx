import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  BookOpen, ArrowLeft, Calendar, User, AlertTriangle,
  CheckCircle2, Clock, ExternalLink, FileText, RefreshCw,
} from 'lucide-react';
import { isPast, isWithinInterval, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Emergency Plan Detail' };

const PLAN_TYPE_LABELS: Record<string, string> = {
  EMERGENCY_OPERATIONS_PLAN: 'Emergency Operations Plan',
  FIRE_RESPONSE_PLAN:        'Fire Response Plan',
  EVACUATION_PLAN:           'Evacuation Plan',
  SHELTER_IN_PLACE:          'Shelter in Place',
  ACTIVE_THREAT:             'Active Threat Plan',
  MASS_CASUALTY:             'Mass Casualty Plan',
  UTILITY_FAILURE:           'Utility Failure Plan',
  IT_DISASTER_RECOVERY:      'IT Disaster Recovery',
  COMMUNICATION_PLAN:        'Communication Plan',
  CONTINUITY_OF_OPERATIONS:  'Continuity of Operations',
  HAZMAT_RESPONSE:           'Hazmat Response Plan',
  PANDEMIC_PLAN:             'Pandemic Plan',
  COMMUNITY_PARTNER_MOU:     'Community Partner MOU',
};

export default async function EmergencyPlanDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const plan = await prisma.emergencyPlan.findFirst({
    where: { id: params.id, facilityId },
  });
  if (!plan) notFound();

  const now = new Date();
  const isOverdue = plan.nextReviewDate && plan.status === 'ACTIVE' && isPast(plan.nextReviewDate);
  const isDueSoon = plan.nextReviewDate && !isOverdue && isWithinInterval(plan.nextReviewDate, { start: now, end: addDays(now, 30) });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link href="/emergency/plans" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Emergency Plans
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900">{plan.planName}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
              plan.status === 'ACTIVE'   ? 'bg-green-100 text-green-800' :
              plan.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-500'  :
                                           'bg-yellow-100 text-yellow-800'
            }`}>
              {plan.status}
            </span>
          </div>
          {plan.documentUrl && (
            <a href={plan.documentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              <ExternalLink className="w-3.5 h-3.5" /> View Document
            </a>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType.replace(/_/g, ' ')} · v{plan.version}
        </p>
      </div>

      {/* Alerts */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Annual Review Overdue</p>
            <p className="text-xs text-red-600">Was due {formatDate(plan.nextReviewDate!)}. Review and update this plan immediately to maintain JC compliance.</p>
          </div>
        </div>
      )}
      {isDueSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Annual review due within 30 days — {formatDate(plan.nextReviewDate!)}.</p>
        </div>
      )}
      {plan.lastReviewedDate && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            Last reviewed {formatDate(plan.lastReviewedDate)}{plan.approvedBy ? ` · Approved by ${plan.approvedBy}` : ''}.
          </p>
        </div>
      )}

      {/* Key info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" /> Plan Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Plan Type</dt>
            <dd className="text-slate-800 font-medium mt-0.5">{PLAN_TYPE_LABELS[plan.planType] ?? plan.planType.replace(/_/g, ' ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Version</dt>
            <dd className="text-slate-800 mt-0.5 font-mono">v{plan.version}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Effective Date</dt>
            <dd className="text-slate-800 mt-0.5">{formatDate(plan.effectiveDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Next Review</dt>
            <dd className={`font-medium mt-0.5 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-800'}`}>
              {formatDate(plan.nextReviewDate)}
            </dd>
          </div>
          {plan.lastReviewedDate && (
            <div>
              <dt className="text-xs font-medium text-slate-500">Last Reviewed</dt>
              <dd className="text-green-700 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {formatDate(plan.lastReviewedDate)}
              </dd>
            </div>
          )}
          {plan.approvedBy && (
            <div>
              <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Approved By</dt>
              <dd className="text-slate-800 mt-0.5">{plan.approvedBy}</dd>
            </div>
          )}
        </dl>
      </div>

      {plan.summary && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Summary / Scope</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.summary}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/emergency/drills"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100"
        >
          View Drills →
        </Link>
        <Link
          href="/emergency/plans"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
        >
          ← All Plans
        </Link>
      </div>
    </div>
  );
}
