'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Square, CheckCheck, Trash2, Download, X } from 'lucide-react';
import { Clock, AlertCircle, CheckCircle2, MessageSquareWarning, Plus } from 'lucide-react';

interface Grievance {
  id: string;
  grievanceNumber: string;
  complainantName: string;
  patientName: string | null;
  category: string;
  severity: string;
  status: string;
  acknowledgmentDueDate: Date;
  resolutionDueDate: Date;
  acknowledgmentDate: Date | null;
  resolutionDate: Date | null;
  dateReceived: Date;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  ACKNOWLEDGMENT_SENT: 'bg-blue-100 text-blue-700',
  PENDING_RESOLUTION: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ESCALATED: 'bg-red-200 text-red-800',
  CLOSED: 'bg-slate-100 text-slate-500',
};

const SEVERITY_COLORS: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-600',
  EXPEDITED: 'bg-orange-100 text-orange-700',
  REGULATORY: 'bg-red-100 text-red-700',
  SENTINEL: 'bg-red-200 text-red-800 font-bold',
};

function DaysIndicator({ dueDate, label }: { dueDate: Date; label: string }) {
  const now = new Date();
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diff < 0;
  const isUrgent = diff >= 0 && diff <= 2;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700 font-semibold' : isUrgent ? 'bg-orange-100 text-orange-700 font-medium' : 'bg-slate-100 text-slate-500'}`}>
      <Clock className="w-3 h-3" />
      {isOverdue ? `${label} OVERDUE by ${Math.abs(diff)}d` : `${label}: ${diff}d left`}
    </span>
  );
}

export function GrievancesListClient({ grievances }: { grievances: Grievance[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(prev => prev.size === grievances.length ? new Set() : new Set(grievances.map(g => g.id)));
  const allSelected = grievances.length > 0 && selected.size === grievances.length;

  async function bulkAction(action: string) {
    setWorking(true);
    setFeedback('');
    try {
      const res = await fetch('/api/grievances/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selected), action }) });
      if (res.ok) {
        const data = await res.json();
        if (action === 'export') {
          const blob = new Blob([data.csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `grievances-${Date.now()}.csv`; a.click();
          URL.revokeObjectURL(url);
        } else { setFeedback(`${data.updated ?? selected.size} updated.`); setSelected(new Set()); window.location.reload(); }
      } else { setFeedback('Action failed.'); }
    } finally { setWorking(false); setConfirming(false); }
  }

  if (grievances.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No grievances logged yet</p>
        <Link href="/trackers/grievances/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Log First Grievance
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Complainant / Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadlines</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Received</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {grievances.map(g => {
              const isClosed = g.status === 'CLOSED' || g.status === 'RESOLVED';
              return (
                <tr key={g.id} className={`hover:bg-slate-50 transition-colors ${selected.has(g.id) ? 'bg-teal-50/30' : ''}`}>
                  <td className="px-3 py-3">
                    <button onClick={() => toggle(g.id)} className="text-muted-foreground/50 hover:text-teal-500">
                      {selected.has(g.id) ? <CheckSquare className="w-4 h-4 text-teal-500" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{g.grievanceNumber}</td>
                  <td className="px-4 py-3"><div className="font-medium text-foreground">{g.complainantName}</div>{g.patientName && <div className="text-xs text-slate-500">Patient: {g.patientName}</div>}</td>
                  <td className="px-4 py-3"><div className="text-xs text-slate-600">{g.category.replace(/_/g, ' ')}</div><span className={`text-xs px-1.5 py-0.5 rounded-full ${SEVERITY_COLORS[g.severity] ?? ''}`}>{g.severity}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[g.status] ?? 'bg-slate-100 text-slate-600'}`}>{g.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3 space-y-1">
                    {!isClosed && !g.acknowledgmentDate && <DaysIndicator dueDate={g.acknowledgmentDueDate} label="ACK" />}
                    {!isClosed && !g.resolutionDate && <DaysIndicator dueDate={g.resolutionDueDate} label="RES" />}
                    {isClosed && <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Complete</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(g.dateReceived)}</td>
                  <td className="px-4 py-3"><Link href={`/trackers/grievances/${g.id}`} className="text-xs text-teal-600 hover:text-teal-700 font-medium">View &rarr;</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
