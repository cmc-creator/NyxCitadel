'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle, Flame, CheckCircle, Clock, AlertCircle,
  Plus, Calendar, FileText, Users, Activity
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function FireSafetyPage() {
  const { data: session } = useSession();
  const [fireData, setFireData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.facilityId) {
      fetch(`/api/fire-safety?facilityId=${session.user.facilityId}`)
        .then(r => r.json())
        .then(d => { setFireData(d); setLoading(false); })
        .catch(e => { console.error(e); setLoading(false); });
    }
  }, [session]);

  if (loading) return <div className="text-center py-12">Loading fire safety data...</div>;

  const complianceScore = fireData?.complianceScore ?? 0;
  const scoreColor = complianceScore >= 90 ? 'text-green-600' :
                     complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600" />
            Fire Safety &amp; Preparedness
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            NFPA 101 &amp; TJC compliance - drills, inspections, equipment maintenance, response plans
          </p>
        </div>
        <Link
          href="/emergency/drills/new?type=FIRE_EVACUATION"
          className="inline-flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Fire Drill
        </Link>
      </div>

      {/* Compliance Score Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fire Safety Compliance Score</p>
            <p className="text-4xl font-bold text-foreground">{complianceScore.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground mt-1">Based on drills, inspections, and equipment maintenance</p>
          </div>
          <div className={`text-6xl font-bold ${scoreColor} opacity-20`}>{complianceScore.toFixed(0)}</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Drills This Year"
          value={fireData?.firedrillsThisYear ?? 0}
          subtitle="12 required (JC)"
          status={fireData?.firedrillsThisYear >= 12 ? 'complete' : 'warning'}
        />
        <StatCard
          icon={CheckCircle}
          label="Recent Drill"
          value={fireData?.lastDrillDate ? new Date(fireData.lastDrillDate).toLocaleDateString() : 'None'}
          subtitle="Evacuation time tracking"
          status="info"
        />
        <StatCard
          icon={AlertTriangle}
          label="Inspections Due"
          value={fireData?.inspectionsDue ?? 0}
          subtitle="Marshal, extinguishers, alarms"
          status={fireData?.inspectionsDue > 0 ? 'warning' : 'complete'}
        />
        <StatCard
          icon={Users}
          label="Staff Trained"
          value={`${fireData?.staffTrained ?? 0}%`}
          subtitle="Annual fire safety training"
          status={fireData?.staffTrained >= 90 ? 'complete' : 'warning'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fire Drills */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Fire Evacuation Drills" icon={Calendar}>
            <p className="text-xs text-muted-foreground mb-4">
              JC requires: 12 fire drills/year (quarterly on all 3 shifts), plus 1 tabletop + 1 functional annually
            </p>
            <div className="space-y-2">
              {fireData?.recentDrills?.length > 0 ? (
                fireData.recentDrills.map((drill: any) => (
                  <Link
                    key={drill.id}
                    href={`/emergency/drills/${drill.id}`}
                    className="block p-3 rounded-lg border border-border/50 hover:border-red-300 hover:bg-red-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{drill.drillName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(drill.scheduledDate).toLocaleDateString()} • {drill.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        drill.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        drill.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {drill.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No fire drills scheduled. Consider scheduling quarterly drills.</p>
              )}
            </div>
            <Link
              href="/emergency/drills?type=FIRE_EVACUATION"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View All Drills →
            </Link>
          </Section>

          {/* Fire Safety Inspections */}
          <Section title="Fire Safety Inspections" icon={AlertTriangle}>
            <p className="text-xs text-muted-foreground mb-4">
              Equipment maintenance, fire marshal inspections, alarm testing, suppression system checks
            </p>
            <div className="space-y-2">
              {fireData?.inspections?.length > 0 ? (
                fireData.inspections.map((insp: any) => (
                  <div key={insp.id} className="p-3 rounded-lg border border-border/50 bg-orange-50/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{insp.category.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Due: {new Date(insp.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        insp.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {insp.completed ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No inspections tracked. Add maintenance records from Environment of Care.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Section title="Fire Response Plan" icon={FileText}>
            <p className="text-xs text-muted-foreground mb-3">
              NFPA 101 & TJC require updated fire response plans with staff roles, evacuation procedures, and containment protocols.
            </p>
            <Link
              href="/emergency/plans?type=FIRE"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Response Plans →
            </Link>
          </Section>

          <Section title="Key Compliance Dates" icon={Clock}>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span><strong>Quarterly:</strong> Fire drills all shifts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span><strong>Annually:</strong> Fire marshal inspection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span><strong>Annually:</strong> Staff fire safety training</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span><strong>As needed:</strong> Equipment maintenance & testing</span>
              </li>
            </ul>
          </Section>

          <Section title="Regulatory References" icon={AlertCircle}>
            <ul className="space-y-1.5 text-xs">
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">NFPA 101</span> - Life Safety Code
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">TJC</span> - Emergency Management standards
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">CMS CoP</span> - 42 CFR 485.68
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-red-600" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, status }: {
  icon: any; label: string; value: string | number; subtitle: string;
  status: 'complete' | 'warning' | 'info';
}) {
  const bgColor = status === 'complete' ? 'bg-green-50 border-green-200' :
                  status === 'warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-blue-50 border-blue-200';
  const iconColor = status === 'complete' ? 'text-green-600' :
                    status === 'warning' ? 'text-orange-600' :
                    'text-blue-600';

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
    </div>
  );
}
