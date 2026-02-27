'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Megaphone,
  Users,
  Activity,
  Flag,
  Eye,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const ACTION_TYPES = [
  { value: 'ACTIVATION',          label: 'Activation',         icon: Zap,          color: 'text-yellow-600' },
  { value: 'NOTIFICATION',        label: 'Notification',       icon: Megaphone,    color: 'text-blue-600' },
  { value: 'EVACUATION',          label: 'Evacuation',         icon: ChevronRight, color: 'text-orange-600' },
  { value: 'COMMUNICATION',       label: 'Communication',      icon: Megaphone,    color: 'text-indigo-600' },
  { value: 'RESOURCE_DEPLOYMENT', label: 'Resource Deploy',    icon: Users,        color: 'text-purple-600' },
  { value: 'PATIENT_CARE',        label: 'Patient Care',       icon: Activity,     color: 'text-green-600' },
  { value: 'ISSUE_NOTED',         label: 'Issue Noted',        icon: Flag,         color: 'text-red-600' },
  { value: 'RESOLUTION',          label: 'Resolution',         icon: CheckCircle2, color: 'text-emerald-600' },
  { value: 'ALL_CLEAR',           label: 'All Clear',          icon: CheckCircle2, color: 'text-emerald-700' },
  { value: 'OBSERVATION',         label: 'Observation',        icon: Eye,          color: 'text-slate-600' },
];

interface DrillAction {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  description: string;
  outcomeNotes?: string | null;
  issueFlag: boolean;
}

interface Props {
  drillId: string;
  initialActions: DrillAction[];
  drillStatus: string;
}

export default function DrillWarRoomClient({ drillId, initialActions, drillStatus }: Props) {
  const [actions, setActions] = useState<DrillAction[]>(initialActions);
  const [actor, setActor] = useState('');
  const [actionType, setActionType] = useState('ACTIVATION');
  const [description, setDescription] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [issueFlag, setIssueFlag] = useState(false);
  const [error, setError] = useState('');
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll timeline to bottom
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [actions]);

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!actor.trim() || !description.trim()) {
      setError('Actor and description are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/drill-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drillId, actor, actionType, description, outcomeNotes, issueFlag }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to log action.');
        return;
      }
      const newAction = await res.json();
      startTransition(() => {
        setActions((prev) => [...prev, newAction]);
      });
      // Reset form
      setActor('');
      setDescription('');
      setOutcomeNotes('');
      setIssueFlag(false);
      setActionType('OBSERVATION');
    } catch {
      setError('Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  const issueCount = actions.filter((a) => a.issueFlag).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Timeline ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-800">Drill Timeline</span>
            {drillStatus === 'IN_PROGRESS' && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
              </span>
            )}
          </div>
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {issueCount} issue{issueCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div
          ref={timelineRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]"
        >
          {actions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              No actions logged yet. Use the form to start the timeline.
            </p>
          ) : (
            actions.map((action, i) => {
              const meta = ACTION_TYPES.find((t) => t.value === action.actionType);
              const Icon = meta?.icon ?? Clock;
              return (
                <div
                  key={action.id}
                  className={`flex gap-3 ${action.issueFlag ? 'bg-red-50 border border-red-200 rounded-lg p-2' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${action.issueFlag ? 'border-red-400' : 'border-slate-200'}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta?.color ?? 'text-slate-500'}`} />
                    </div>
                    {i < actions.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {new Date(action.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${meta?.color ?? 'text-slate-500'} bg-slate-100`}>
                        {meta?.label ?? action.actionType}
                      </span>
                      {action.issueFlag && (
                        <span className="text-xs font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Flag className="w-2.5 h-2.5" /> Issue
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{action.description}</p>
                    <p className="text-xs text-slate-500">by {action.actor}</p>
                    {action.outcomeNotes && (
                      <p className="text-xs text-slate-600 mt-1 italic">{action.outcomeNotes}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Log Action Form ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-slate-800">Log Action</span>
        </div>
        <form onSubmit={submitAction} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Type *</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ACTION_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setActionType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      actionType === t.value
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Actor / Role *</label>
            <input
              type="text"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="e.g. Charge Nurse – Unit 2"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What happened? Be specific."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Outcome / Notes</label>
            <input
              type="text"
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="Result, follow-up, or recommendation"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={issueFlag}
              onChange={(e) => setIssueFlag(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-sm text-red-700 font-medium flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" /> Flag as Issue / Gap for AAR
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Logging…' : 'Log Action'}
          </button>
        </form>
      </div>
    </div>
  );
}
