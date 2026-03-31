"use client";

import { useEffect, useState } from 'react';

type PilotKpiResponse = {
  staffActivationRate: number;
  complianceCompletionRate: number;
  capOverdueRate: number;
  trainingCompletionRate: number;
  automationReliabilityRate: number;
  metrics: {
    activeUsers: number;
    totalUsers: number;
    complianceTotal: number;
    complianceDone: number;
    openCaps: number;
    overdueCaps: number;
    capsClosed30: number;
    incidents30: number;
    criticalIncidents30: number;
    trainingsRequired: number;
    trainingsCompleted: number;
    alertRuns30: number;
    exportRuns30: number;
    automationRuns30: number;
  };
  generatedAt: string;
};

function scoreColor(value: number): string {
  if (value >= 90) return 'text-emerald-400';
  if (value >= 75) return 'text-amber-400';
  return 'text-red-400';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function PilotKpisPage() {
  const [data, setData] = useState<PilotKpiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/pilot-kpis', { cache: 'no-store' });
        if (!res.ok) throw new Error('Unable to load pilot metrics right now.');
        const payload = (await res.json()) as PilotKpiResponse;
        setData(payload);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load pilot metrics right now.');
      }
    }

    void load();
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Pilot KPI Dashboard</h1>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Pilot KPI Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pilot KPI Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Use these buyer-facing outcomes to show operational impact during pilots and procurement reviews.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Staff Activation</p>
          <p className={`text-2xl font-bold ${scoreColor(data.staffActivationRate)}`}>{data.staffActivationRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Compliance Completion</p>
          <p className={`text-2xl font-bold ${scoreColor(data.complianceCompletionRate)}`}>{data.complianceCompletionRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">CAP Overdue Rate</p>
          <p className={`text-2xl font-bold ${data.capOverdueRate <= 10 ? 'text-emerald-400' : data.capOverdueRate <= 25 ? 'text-amber-400' : 'text-red-400'}`}>{data.capOverdueRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Training Completion</p>
          <p className={`text-2xl font-bold ${scoreColor(data.trainingCompletionRate)}`}>{data.trainingCompletionRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Automation Reliability</p>
          <p className={`text-2xl font-bold ${scoreColor(data.automationReliabilityRate)}`}>{data.automationReliabilityRate}%</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">30-Day Operational Outcomes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><p className="text-muted-foreground">CAPs Closed</p><p className="text-foreground font-semibold">{data.metrics.capsClosed30}</p></div>
          <div><p className="text-muted-foreground">Incidents Logged</p><p className="text-foreground font-semibold">{data.metrics.incidents30}</p></div>
          <div><p className="text-muted-foreground">Critical Incidents</p><p className="text-foreground font-semibold">{data.metrics.criticalIncidents30}</p></div>
          <div><p className="text-muted-foreground">Automation Runs</p><p className="text-foreground font-semibold">{data.metrics.automationRuns30}</p></div>
          <div><p className="text-muted-foreground">Alert Runs</p><p className="text-foreground font-semibold">{data.metrics.alertRuns30}</p></div>
          <div><p className="text-muted-foreground">Export Runs</p><p className="text-foreground font-semibold">{data.metrics.exportRuns30}</p></div>
          <div><p className="text-muted-foreground">Required Training Records</p><p className="text-foreground font-semibold">{data.metrics.trainingsRequired}</p></div>
          <div><p className="text-muted-foreground">Completed Training Records</p><p className="text-foreground font-semibold">{data.metrics.trainingsCompleted}</p></div>
        </div>
        <p className="text-xs text-muted-foreground">Generated {formatDate(data.generatedAt)}</p>
      </div>
    </div>
  );
}
