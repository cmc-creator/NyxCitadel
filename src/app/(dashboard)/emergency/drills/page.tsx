import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Siren, Plus, Info } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Drills & Exercises' };

export default async function DrillsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const drills = await prisma.drill.findMany({
    where: {
      facilityId,
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(searchParams.type ? { drillType: searchParams.type as never } : {}),
    },
    orderBy: { scheduledDate: 'desc' },
  });

  // JC requires: fire drills on all 3 shifts per quarter = 12/year minimum
  // Plus 1 tabletop + 1 functional per year
  const currentYear = new Date().getFullYear();
  const yearDrills = drills.filter(
    (d) => new Date(d.scheduledDate).getFullYear() === currentYear
  );
  const completedFireDrills = yearDrills.filter(
    (d) => d.drillType === 'FIRE_EVACUATION' && d.status === 'COMPLETED'
  ).length;
  const completedTabletops = yearDrills.filter(
    (d) => d.drillType === 'TABLETOP' && d.status === 'COMPLETED'
  ).length;
  const completedFunctional = yearDrills.filter(
    (d) => ['FUNCTIONAL_DRILL', 'FULL_SCALE'].includes(d.drillType) && d.status === 'COMPLETED'
  ).length;

  const statusColor: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-500',
    RESCHEDULED: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Siren className="w-6 h-6 text-blue-600" />
            Drills &amp; Exercises
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track all emergency drills, exercises, and after-action reviews
          </p>
        </div>
        <Link
          href="/emergency/drills/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Drill
        </Link>
      </div>

      {/* JC Requirements Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-slate-800">
            {currentYear} Joint Commission Drill Requirements Progress
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <DrillRequirementBar
            label="Fire Evacuation Drills"
            description="All shifts, quarterly (min. 12/year)"
            completed={completedFireDrills}
            required={12}
          />
          <DrillRequirementBar
            label="Tabletop Exercise"
            description="Min. 1/year"
            completed={completedTabletops}
            required={1}
          />
          <DrillRequirementBar
            label="Functional / Full-Scale Exercise"
            description="Min. 1/year"
            completed={completedFunctional}
            required={1}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: '/emergency/drills', label: `All (${drills.length})`, active: !searchParams.status },
          { href: '/emergency/drills?status=SCHEDULED', label: 'Scheduled', active: searchParams.status === 'SCHEDULED' },
          { href: '/emergency/drills?status=COMPLETED', label: 'Completed', active: searchParams.status === 'COMPLETED' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              tab.active
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Drill Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Scheduled</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Conducted</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Participants</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">AAR Due</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {drills.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No drills found.{' '}
                  <Link href="/emergency/drills/new" className="text-purple-600 hover:underline">
                    Schedule your first drill
                  </Link>
                </td>
              </tr>
            ) : (
              drills.map((drill) => {
                const aarDue = drill.conductedDate
                  ? new Date(new Date(drill.conductedDate).getTime() + 30 * 24 * 60 * 60 * 1000)
                  : null;
                const aarOverdue =
                  aarDue &&
                  new Date() > aarDue &&
                  drill.status !== 'COMPLETED';
                return (
                  <tr key={drill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{drill.drillName}</p>
                      {drill.location && (
                        <p className="text-xs text-slate-400">{drill.location}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {drill.drillType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(drill.scheduledDate)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {drill.conductedDate ? formatDate(drill.conductedDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {drill.participantCount ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {aarDue ? (
                        <span className={aarOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
                          {aarOverdue ? '⚠ ' : ''}{formatDate(aarDue)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[drill.status] ?? ''}`}>
                        {drill.status}
                      </span>
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

function DrillRequirementBar({
  label,
  description,
  completed,
  required,
}: {
  label: string;
  description: string;
  completed: number;
  required: number;
}) {
  const pct = Math.min((completed / required) * 100, 100);
  const isDone = completed >= required;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className={`text-xs font-bold ${isDone ? 'text-green-600' : 'text-red-600'}`}>
          {completed}/{required}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full transition-all ${isDone ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}
