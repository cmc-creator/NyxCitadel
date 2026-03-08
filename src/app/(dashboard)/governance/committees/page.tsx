'use client';

import { useState } from 'react';
import { Building2, Plus, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const mockMeetings = [
  { id: '1', committeeType: 'MEC', meetingDate: '2026-03-04', chair: 'Dr. Martinez, Chief of Staff', attendees: 9, quorumAchieved: true, minutesApproved: true, actionItems: 2, topics: 'Credentialing: 2 new providers. Q4 2025 QI data reviewed.' },
  { id: '2', committeeType: 'QAPI', meetingDate: '2026-02-18', chair: 'Dr. Chen, CMO', attendees: 11, quorumAchieved: true, minutesApproved: true, actionItems: 3, topics: 'Q4 PI projects reviewed. 3 action items. Incident rate trending down 12%.' },
  { id: '3', committeeType: 'PT', meetingDate: '2026-02-20', chair: 'Dr. Kim, PharmD', attendees: 6, quorumAchieved: true, minutesApproved: false, actionItems: 1, topics: 'Formulary additions: 2. Removal: 1. Med error trends discussed.' },
  { id: '4', committeeType: 'SAFETY', meetingDate: '2026-02-12', chair: 'Dr. Nguyen, CNO', attendees: 8, quorumAchieved: true, minutesApproved: true, actionItems: 1, topics: 'EOC rounds: 1 fire exit finding. Corrective action assigned to facilities.' },
  { id: '5', committeeType: 'ETHICS', meetingDate: '2026-01-30', chair: 'Dr. Williams', attendees: 5, quorumAchieved: false, minutesApproved: true, actionItems: 0, topics: 'Capacity determination consultation case reviewed.' },
  { id: '6', committeeType: 'PEER_REVIEW', meetingDate: '2026-01-15', chair: 'Dr. Martinez', attendees: 7, quorumAchieved: true, minutesApproved: true, actionItems: 2, topics: 'OPPE/FPPE results for 4 providers reviewed. 1 focused review initiated.' },
];

const committeeConfig: Record<string, { label: string; color: string }> = {
  MEC:          { label: 'MEC',         color: 'bg-indigo-100 text-indigo-700' },
  QAPI:         { label: 'QA/QAPI',     color: 'bg-violet-100 text-violet-700' },
  PT:           { label: 'P&T',         color: 'bg-emerald-100 text-emerald-700' },
  SAFETY:       { label: 'Safety',      color: 'bg-amber-100 text-amber-700' },
  ETHICS:       { label: 'Ethics',      color: 'bg-rose-100 text-rose-700' },
  PEER_REVIEW:  { label: 'Peer Review', color: 'bg-blue-100 text-blue-700' },
};

export default function CommitteesPage() {
  const [filter, setFilter] = useState('ALL');
  const noQuorum = mockMeetings.filter(m => !m.quorumAchieved).length;
  const filtered = filter === 'ALL' ? mockMeetings : mockMeetings.filter(m => m.committeeType === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Committee Meetings</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">JCAHO LD.03.01</span>
          </div>
          <p className="text-slate-400 text-sm">All governance committee meeting logs — MEC, QAPI, P&T, Safety, Ethics, and Peer Review.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Meeting
        </button>
      </div>

      {noQuorum > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{noQuorum} meeting(s) did not achieve quorum — actions taken at these meetings may require ratification at the next meeting.</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...Object.keys(committeeConfig)].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {f === 'ALL' ? 'All Committees' : committeeConfig[f]?.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Committee', 'Date', 'Chair', 'Attendees', 'Quorum', 'Minutes Approved', 'Action Items', 'Topics'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${committeeConfig[m.committeeType]?.color}`}>
                    {committeeConfig[m.committeeType]?.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-400 text-xs">{m.meetingDate}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">{m.chair}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">{m.attendees}</td>
                <td className="px-3 py-3">
                  {m.quorumAchieved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </td>
                <td className="px-3 py-3">
                  {m.minutesApproved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-amber-400">Pending</span>}
                </td>
                <td className="px-3 py-3 text-slate-300 text-xs">{m.actionItems}</td>
                <td className="px-3 py-3 text-slate-400 text-xs max-w-xs truncate">{m.topics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
