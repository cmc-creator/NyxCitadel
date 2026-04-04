'use client';

import { Download } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  incidentDate: string;
  eventCategory: string;
  jcReportable: boolean;
  severity: string;
}

interface Props { incidents: Incident[] }

function buildCSV(incidents: Incident[]): string {
  const rows = [
    ['ADHS IAD/IR Incident Submission Export'],
    [`Generated: ${new Date().toISOString()}`],
    [],
    ['Incident ID', 'Title', 'Date', 'Category', 'Severity', 'JC Reportable'],
    ...incidents.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.incidentDate,
      i.eventCategory,
      i.severity,
      i.jcReportable ? 'Yes' : 'No',
    ]),
  ];
  return rows.map(r => r.join(',')).join('\n');
}

export function AdhsExportButton({ incidents }: Props) {
  function handleExport() {
    if (incidents.length === 0) { alert('No IAD incidents to export.'); return; }
    const csv  = buildCSV(incidents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ADHS_IAD_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}
