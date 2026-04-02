'use client';

import { IncidentBarChart } from '@/components/quality/qapi-charts';

interface ChartData {
  name: string;
  count: number;
}

export function QapiOverviewCharts({
  incidentChartData,
  incidentTypeData,
}: {
  incidentChartData: ChartData[];
  incidentTypeData: ChartData[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Incidents - Last 6 Months</h3>
        <IncidentBarChart data={incidentChartData} />
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Incidents by Type (All Time)</h3>
        {incidentTypeData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground/70 text-sm">
            No incident data yet
          </div>
        ) : (
          <IncidentBarChart data={incidentTypeData} />
        )}
      </div>
    </div>
  );
}
