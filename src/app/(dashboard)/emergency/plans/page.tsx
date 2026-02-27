import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { BookOpen, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { isPast } from 'date-fns';

export const metadata = { title: 'Emergency Plans' };

export default async function EmergencyPlansPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const plans = await prisma.emergencyPlan.findMany({
    where: { facilityId },
    orderBy: [{ status: 'asc' }, { nextReviewDate: 'asc' }],
  });

  const overdueCount = plans.filter(
    (p) => p.nextReviewDate && isPast(p.nextReviewDate) && p.status === 'ACTIVE'
  ).length;

  const planTypeLabel: Record<string, string> = {
    EMERGENCY_OPERATIONS_PLAN: 'Emergency Operations Plan',
    FIRE_RESPONSE_PLAN: 'Fire Response Plan',
    EVACUATION_PLAN: 'Evacuation Plan',
    SHELTER_IN_PLACE: 'Shelter in Place',
    ACTIVE_THREAT: 'Active Threat Plan',
    MASS_CASUALTY: 'Mass Casualty Plan',
    UTILITY_FAILURE: 'Utility Failure Plan',
    IT_DISASTER_RECOVERY: 'IT Disaster Recovery',
    COMMUNICATION_PLAN: 'Communication Plan',
    CONTINUITY_OF_OPERATIONS: 'Continuity of Operations',
    HAZMAT_RESPONSE: 'Hazmat Response Plan',
    PANDEMIC_PLAN: 'Pandemic Plan',
    COMMUNITY_PARTNER_MOU: 'Community Partner MOU',
  };

  // Plans that Joint Commission requires for psychiatric hospitals
  const requiredPlanTypes = [
    'EMERGENCY_OPERATIONS_PLAN',
    'FIRE_RESPONSE_PLAN',
    'EVACUATION_PLAN',
    'SHELTER_IN_PLACE',
    'ACTIVE_THREAT',
    'UTILITY_FAILURE',
    'IT_DISASTER_RECOVERY',
    'COMMUNICATION_PLAN',
    'CONTINUITY_OF_OPERATIONS',
  ];
  const existingTypes = new Set(plans.map((p) => p.planType));
  const missingPlans = requiredPlanTypes.filter((t) => !existingTypes.has(t as never));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Emergency Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {plans.length} plans · {overdueCount} overdue for review
          </p>
        </div>
        <Link
          href="/emergency/plans/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Plan
        </Link>
      </div>

      {missingPlans.length > 0 && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {missingPlans.length} required plan(s) not found in registry:
            </p>
            <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
              {missingPlans.map((t) => (
                <li key={t}>{planTypeLabel[t] ?? t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-bold">{overdueCount} plans</span> are past their annual review date.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Version</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Effective Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Last Reviewed</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Next Review</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {plans.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No emergency plans found.{' '}
                  <Link href="/emergency/plans/new" className="text-purple-600 hover:underline">
                    Add your first plan
                  </Link>
                </td>
              </tr>
            ) : (
              plans.map((plan) => {
                const isOverdue =
                  plan.nextReviewDate && isPast(plan.nextReviewDate) && plan.status === 'ACTIVE';
                const { label, className } = getDueDateStatus(plan.nextReviewDate);
                return (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/emergency/plans/${plan.id}`} className="font-medium text-slate-800 hover:underline hover:text-purple-700">{plan.planName}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {planTypeLabel[plan.planType] ?? plan.planType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">v{plan.version}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(plan.effectiveDate)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {plan.lastReviewedDate ? formatDate(plan.lastReviewedDate) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        isOverdue ? 'status-overdue' : className
                      }`}>
                        {isOverdue ? 'Overdue' : formatDate(plan.nextReviewDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        plan.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : plan.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {plan.documentUrl ? (
                        <a
                          href={plan.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
