import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
  Siren,
  ShieldAlert,
  BookOpen,
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Emergency Management' };

export default async function EmergencyManagementPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = addDays(now, 90);

  const [currentHva, upcomingDrills, recentDrills, activePlans] =
    await Promise.all([
      prisma.hvaAssessment.findFirst({
        where: { facilityId, assessmentYear: now.getFullYear() },
        include: { hazards: { orderBy: { riskScore: 'desc' }, take: 5 } },
      }),
      prisma.drill.findMany({
        where: {
          facilityId,
          scheduledDate: { gte: now, lte: in90 },
          status: { not: 'CANCELLED' },
        },
        orderBy: { scheduledDate: 'asc' },
        take: 5,
      }),
      prisma.drill.findMany({
        where: {
          facilityId,
          conductedDate: { not: null },
          status: 'COMPLETED',
        },
        orderBy: { conductedDate: 'desc' },
        take: 5,
      }),
      prisma.emergencyPlan.findMany({
        where: { facilityId, status: { not: 'ARCHIVED' } },
        orderBy: { nextReviewDate: 'asc' },
      }),
    ]);

  const drillTypeLabel = (type: string) => type.replace(/_/g, ' ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Siren className="w-6 h-6 text-teal-400" />
            Emergency Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            HVA · Drills &amp; Exercises · Plans · Joint Commission EM Standards
          </p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/emergency/hva"
          className="bg-card rounded-xl border border-border p-5 hover:border-amber-600/50 hover:-translate-y-0.5 transition-all flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">HVA Assessment</p>
            <p className="text-xs text-muted-foreground">
              {currentHva
                ? currentHva.status === 'APPROVED'
                  ? '✅ Complete'
                  : `In Progress - ${currentHva.hazards.length} hazards`
                : `Not started for ${now.getFullYear()}`}
            </p>
          </div>
        </Link>

        <Link
          href="/emergency/drills"
          className="bg-card rounded-xl border border-border p-5 hover:border-blue-600/50 hover:-translate-y-0.5 transition-all flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-800/30 flex items-center justify-center">
            <Siren className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Drills &amp; Exercises</p>
            <p className="text-xs text-muted-foreground">
              {upcomingDrills.length} upcoming · {recentDrills.length} recently completed
            </p>
          </div>
        </Link>

        <Link
          href="/emergency/plans"
          className="bg-card rounded-xl border border-border p-5 hover:border-teal-600/50 hover:-translate-y-0.5 transition-all flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-950/40 border border-teal-800/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">EM Plans</p>
            <p className="text-xs text-muted-foreground">
              {activePlans.length} active plans
            </p>
          </div>
        </Link>
      </div>

      {/* HVA Summary */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            {now.getFullYear()} Hazard Vulnerability Analysis (HVA)
          </h2>
          <div className="flex gap-2">
            {!currentHva && (
              <Link
                href="/emergency/hva/new"
                className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Start HVA
              </Link>
            )}
            <Link href="/emergency/hva" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View full HVA →
            </Link>
          </div>
        </div>
        {currentHva ? (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                currentHva.status === 'APPROVED'
                  ? 'bg-green-950/40 text-green-400'
                  : currentHva.status === 'COMPLETED'
                  ? 'bg-blue-950/40 text-blue-400'
                  : 'bg-yellow-950/40 text-yellow-400'
              }`}>
                {currentHva.status}
              </span>
              {currentHva.completedDate && (
                <span className="text-sm text-muted-foreground">
                  Completed: {formatDate(currentHva.completedDate)}
                </span>
              )}
              {currentHva.totalRiskScore !== null && (
                <span className="text-sm text-muted-foreground">
                  Overall Risk Score: <span className="font-semibold text-foreground">{currentHva.totalRiskScore.toFixed(1)}</span>
                </span>
              )}
            </div>
            {currentHva.hazards.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Top Risk Hazards (by Risk Score)
                </p>
                <div className="space-y-2">
                  {currentHva.hazards.map((hazard) => (
                    <div key={hazard.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-slate-300">{hazard.hazardName}</span>
                          <span className="text-xs font-semibold text-muted-foreground/70">{(hazard.riskScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              hazard.riskScore > 0.7
                                ? 'bg-red-500'
                                : hazard.riskScore > 0.4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${hazard.riskScore * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs bg-slate-800 text-muted-foreground/70 px-1.5 py-0.5 rounded flex-shrink-0">
                        {hazard.hazardType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground/70">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-medium">No HVA for {now.getFullYear()} yet</p>
            <p className="text-sm mt-1">
              The HVA should be completed annually in Q1.{' '}
              <Link href="/emergency/hva/new" className="text-amber-400 hover:underline">
                Start now
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Drills + Recent Drills */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Upcoming Drills (90 days)
            </h2>
            <Link href="/emergency/drills/new" className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium">
              <Plus className="w-3 h-3" /> Add
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {upcomingDrills.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground/70 py-8">No upcoming drills scheduled</p>
            ) : (
              upcomingDrills.map((drill) => (
                <div key={drill.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-950/40 border border-blue-800/30 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-400 leading-none">
                      {formatDate(drill.scheduledDate, 'd')}
                    </span>
                    <span className="text-[9px] text-blue-400/70 leading-none">
                      {formatDate(drill.scheduledDate, 'MMM')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{drill.drillName}</p>
                    <p className="text-xs text-muted-foreground/70">{drillTypeLabel(drill.drillType)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Completed */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Recently Completed Drills
            </h2>
            <Link href="/emergency/drills" className="text-xs text-teal-400 hover:text-teal-300 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentDrills.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground/70 py-8">No completed drills yet</p>
            ) : (
              recentDrills.map((drill) => (
                <div key={drill.id} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{drill.drillName}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {drillTypeLabel(drill.drillType)} · {formatDate(drill.conductedDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
