'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Square, CheckCheck, Trash2, Download, X, Plus } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

interface Incident {
  id: string;
  incidentNumber: string;
  description: string;
  incidentType: string;
  severity: string;
  status: string;
  dateOccurred: Date;
  reportableToState: boolean;
  reportedToState: boolean;
  stateReportDate: Date | null;
  correctionRequired: boolean;
  cap: { id: string; capNumber: string; status: string } | null;
}

const severityColor: Record<string, string> = {
  MINOR: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CATASTROPHIC: 'bg-red-100 text-red-800',
  SENTINEL: 'bg-red-600 text-white',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  RCA_IN_PROGRESS: 'bg-orange-100 text-orange-800',
  CAP_IN_PROGRESS: 'bg-teal-100 text-teal-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  REPORTABLE_PENDING: 'bg-red-100 text-red-800',
};

export function IncidentsListClient({ incidents }: { incidents: Incident[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(prev => prev.size === incidents.length ? new Set() : new Set(incidents.map(i => i.id)));
  const allSelected = incidents.length > 0 && selected.size === incidents.length;

  async function bulkAction(action: string) {
    setWorking(true);
    setFeedback('');
    try {
      const res = await fetch('/api/incidents/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selected), action }) });
      if (res.ok) {
        const data = await res.json();
        if (action === 'export') {
          const blob = new Blob([data.csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `incidents-${Date.now()}.csv`; a.click();
          URL.revokeObjectURL(url);
        } else { setFeedback(`${data.updated ?? selected.size} updated.`); setSelected(new Set()); window.location.reload(); }
      } else { setFeedback('Action failed.'); }
    } finally { setWorking(false); setConfirming(false); }
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-card rounded-xl border border-border text-center">
        <div className="w-16 h-16 rounded-full bg-teal-600/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-teal-600/70" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No incidents found</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Your incident tracker is clear. When an event occurs, file a report to start tracking it through investigation and closure.
        </p>
        <Link
          href="/trackers/incidents/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          File New Incident Report
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="sticky top-2 z-10 flex items-center gap-2 bg-teal-900/90 backdrop-blur border border-teal-500/40 rounded-xl px-4 py-2.5 shadow-lg flex-wrap">
          <span className="text-sm font-medium text-teal-200">{selected.size} selected</span>
          <div className="flex-1" />
          {feedback && <span className="text-xs text-teal-300">{feedback}</span>}
          <button onClick={() => bulkAction('export')} disabled={working} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-lg transition-colors disabled:opacity-50"><Download className="w-3.5 h-3.5" /> Export CSV</button>
          <button onClick={() => bulkAction('close')} disabled={working} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50"><CheckCheck className="w-3.5 h-3.5" /> Mark Closed</button>
          {!confirming ? (
            <button onClick={() => setConfirming(true)} disabled={working} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          ) : (
            <>
              <button onClick={() => bulkAction('delete')} disabled={working} className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50">Confirm Delete</button>
              <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1.5 text-muted-foreground/70 hover:text-foreground">Cancel</button>
            </>
          )}
          <button onClick={() => setSelected(new Set())} className="p-1 text-muted-foreground/50 hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-3 w-8">
                <button onClick={toggleAll} className="text-muted-foreground/50 hover:text-teal-500">
                  {allSelected ? <CheckSquare className="w-4 h-4 text-teal-500" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Incident #</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Severity</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Reportable</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">CAP</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {incidents.map(incident => (
              <tr key={incident.id} className={`hover:bg-slate-50 transition-colors ${selected.has(incident.id) ? 'bg-teal-50/30' : ''}`}>
                <td className="px-3 py-3">
                  <button onClick={() => toggle(incident.id)} className="text-muted-foreground/50 hover:text-teal-500">
                    {selected.has(incident.id) ? <CheckSquare className="w-4 h-4 text-teal-500" /> : <Square className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  <Link href={`/trackers/incidents/${incident.id}`} className="text-teal-600 hover:underline">{incident.incidentNumber}</Link>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{formatDate(incident.dateOccurred)}</td>
                <td className="px-4 py-3 text-xs text-foreground/80">{incident.incidentType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor[incident.severity] ?? ''}`}>{incident.severity}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{incident.description}</td>
                <td className="px-4 py-3 text-xs">
                  {incident.reportableToState ? (
                    <span className={`font-medium ${incident.reportedToState ? 'text-green-600' : 'text-red-600'}`}>
                      {incident.reportedToState ? `Reported ${formatDate(incident.stateReportDate)}` : '\u26a0 Not Reported'}
                    </span>
                  ) : <span className="text-muted-foreground/70">N/A</span>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {incident.cap ? (
                    <Link href="/trackers/caps" className="text-teal-600 hover:underline font-mono">{incident.cap.capNumber}</Link>
                  ) : incident.correctionRequired ? (
                    <Link href={`/trackers/caps/new?incidentId=${incident.id}`} className="text-orange-600 hover:underline">Create CAP</Link>
                  ) : <span className="text-muted-foreground/70">-</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[incident.status] ?? ''}`}>{incident.status.replace(/_/g, ' ')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
