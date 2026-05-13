'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Clock, AlertTriangle, CheckCircle2, Loader2, MapPin, Flame,
  Radio, Users, QrCode, Plus, X, ShieldAlert, BarChart3, RefreshCw,
} from 'lucide-react';

//  Types 

interface DrillAction {
  id: string;
  actionType: string;
  description: string;
  severity: string;
  performedBy: string | null;
  location: string | null;
  createdAt: string;
}

interface KillTask {
  id: string;
  taskName: string;
  assignedRole: string;
  locationLabel: string;
  qrToken: string;
  timeLimitMinutes: number;
  isRequired: boolean;
  completedAt: string | null;
  completedBy: string | null;
  isMissed: boolean;
}

interface MusterEntry {
  id: string;
  staffName: string;
  staffRole: string | null;
  department: string | null;
  musterPoint: string | null;
  qrToken: string;
  status: 'UNACCOUNTED' | 'PRESENT' | 'EXCUSED' | 'GHOSTED';
  checkedInAt: string | null;
}

interface Props {
  drillId: string;
  initialActions: DrillAction[];
  initialKillTasks: KillTask[];
  initialMuster: MusterEntry[];
  drillStatus: string;
  drillName: string;
}

interface RawDrillAction {
  id: string;
  actionType: string;
  description: string;
  severity?: string | null;
  actor?: string | null;
  performedBy?: string | null;
  location?: string | null;
  timestamp?: string | null;
  createdAt?: string | null;
}

//  Constants 

const ACTION_TYPES = [
  { value: 'EVACUATION_INITIATED', label: 'Evacuation Initiated' },
  { value: 'ALL_CLEAR', label: 'All Clear' },
  { value: 'FIRE_DETECTED', label: 'Fire Detected' },
  { value: 'STAFF_ASSIGNED', label: 'Staff Assigned' },
  { value: 'PATIENT_MOVED', label: 'Patient Moved' },
  { value: 'DOOR_SECURED', label: 'Door Secured' },
  { value: 'UTILITY_SHUTOFF', label: 'Utility Shutoff' },
  { value: 'COMMUNICATION_SENT', label: 'Communication Sent' },
  { value: 'ESCALATION', label: 'Escalation' },
  { value: 'NOTE', label: 'General Note' },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-slate-100 text-foreground/80 border-slate-200',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  FIRE_DETECTED: Flame,
  EVACUATION_INITIATED: AlertTriangle,
  ALL_CLEAR: CheckCircle2,
  COMMUNICATION_SENT: Radio,
  STAFF_ASSIGNED: Users,
};

function qrUrl(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`;
}

//  Component 

export default function DrillWarRoomClient({
  drillId,
  initialActions,
  initialKillTasks,
  initialMuster,
  drillStatus,
}: Props) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'killtasks' | 'muster'>('timeline');
  const [actions, setActions] = useState<DrillAction[]>(initialActions);
  const [killTasks, setKillTasks] = useState<KillTask[]>(initialKillTasks);
  const [muster, setMuster] = useState<MusterEntry[]>(initialMuster);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const actionsRef = useRef(actions);
  const killTasksRef = useRef(killTasks);
  const musterRef = useRef(muster);

  // Keep refs in sync so the polling effect can read latest state without re-subscribing
  useEffect(() => { actionsRef.current = actions; }, [actions]);
  useEffect(() => { killTasksRef.current = killTasks; }, [killTasks]);
  useEffect(() => { musterRef.current = muster; }, [muster]);

  // Live polling - 10-second interval while drill is IN_PROGRESS
  useEffect(() => {
    if (drillStatus !== 'IN_PROGRESS') return;

    async function poll() {
      setSyncing(true);
      try {
        const [actRes, taskRes, musterRes] = await Promise.all([
          fetch(`/api/drill-actions?drillId=${drillId}`),
          fetch(`/api/drill-tasks?drillId=${drillId}`),
          fetch(`/api/drill-muster?drillId=${drillId}`),
        ]);
        if (!actRes.ok || !taskRes.ok || !musterRes.ok) return;

        const [rawActions, rawTasks, rawMuster] = (await Promise.all([
          actRes.json(), taskRes.json(), musterRes.json(),
        ])) as [RawDrillAction[], KillTask[], MusterEntry[]];

        // Map DB shape → client interface shape
        const mappedActions: DrillAction[] = rawActions.map((a) => ({
          id:          a.id,
          actionType:  a.actionType,
          description: a.description,
          severity:    a.severity ?? 'LOW',
          performedBy: a.actor ?? a.performedBy ?? null,
          location:    a.location ?? null,
          createdAt:   a.timestamp ?? a.createdAt ?? '',
        }));

        // Only update if counts changed (avoid flicker when nothing new)
        if (mappedActions.length !== actionsRef.current.length) setActions(mappedActions);
        if (rawTasks.length !== killTasksRef.current.length || rawTasks.some((t, i: number) => {
          const ex = killTasksRef.current[i];
          return !ex || t.completedAt !== ex.completedAt || t.isMissed !== ex.isMissed;
        })) setKillTasks(rawTasks);
        if (rawMuster.length !== musterRef.current.length || rawMuster.some((e, i: number) => {
          const ex = musterRef.current[i];
          return !ex || e.status !== ex.status;
        })) setMuster(rawMuster);

        setLastSynced(new Date());
      } catch {
        // Network error - silently skip this poll cycle
      } finally {
        setSyncing(false);
      }
    }

    poll(); // immediate first poll
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [drillId, drillStatus]);

  // Log action form
  const [logForm, setLogForm] = useState({
    actionType: 'NOTE', description: '', severity: 'LOW', performedBy: '', location: '',
  });

  // Add kill task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    taskName: '', assignedRole: '', locationLabel: '', timeLimitMinutes: 3, isRequired: true,
  });
  const [addingTask, setAddingTask] = useState(false);

  // Add muster staff form
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    staffName: '', staffRole: '', department: '', musterPoint: '',
  });
  const [addingStaff, setAddingStaff] = useState(false);

  //  Handlers 

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/drill-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drillId, ...logForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setActions((prev) => [data, ...prev]);
        setLogForm({ actionType: 'NOTE', description: '', severity: 'LOW', performedBy: '', location: '' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function addKillTask(e: React.FormEvent) {
    e.preventDefault();
    setAddingTask(true);
    try {
      const res = await fetch('/api/drill-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drillId, ...taskForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setKillTasks((prev) => [...prev, data]);
        setTaskForm({ taskName: '', assignedRole: '', locationLabel: '', timeLimitMinutes: 3, isRequired: true });
        setShowTaskForm(false);
      }
    } finally {
      setAddingTask(false);
    }
  }

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setAddingStaff(true);
    try {
      const res = await fetch('/api/drill-muster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drillId, ...staffForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMuster((prev) => [...prev, data]);
        setStaffForm({ staffName: '', staffRole: '', department: '', musterPoint: '' });
        setShowStaffForm(false);
      }
    } finally {
      setAddingStaff(false);
    }
  }

  async function removeStaff(id: string) {
    await fetch(`/api/drill-muster?id=${id}`, { method: 'DELETE' });
    setMuster((prev) => prev.filter((e) => e.id !== id));
  }

  async function endDrill() {
    if (!confirm('End the drill and compute the Resilience Scorecard?')) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/drills/${drillId}/end`, { method: 'POST' });
      if (res.ok) window.location.href = `/emergency/drills/${drillId}/scorecard`;
    } finally {
      setEnding(false);
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const accountedCount = muster.filter((e) => e.status === 'PRESENT' || e.status === 'EXCUSED').length;
  const accountabilityPct = muster.length ? Math.round((accountedCount / muster.length) * 100) : 0;
  const requiredTasks = killTasks.filter((t) => t.isRequired);
  const completedOnTime = killTasks.filter((t) => t.completedAt && !t.isMissed).length;

  return (
    <div className="bg-slate-900 rounded-2xl text-white overflow-hidden shadow-2xl">
      {/* War Room Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span className="font-bold text-sm tracking-wide text-slate-100">War Room</span>
          {drillStatus === 'IN_PROGRESS' && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse font-medium ml-1">
              LIVE
            </span>
          )}
          {drillStatus === 'IN_PROGRESS' && (
            <span className="hidden md:flex items-center gap-1 text-xs text-slate-500 ml-2">
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-muted-foreground/70' : 'text-slate-600'}`} />
              {lastSynced ? `synced ${lastSynced.toLocaleTimeString()}` : 'syncing…'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{accountabilityPct}% accounted
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />{completedOnTime}/{requiredTasks.length} tasks done
            </span>
          </div>
          {drillStatus === 'IN_PROGRESS' && (
            <button
              onClick={endDrill}
              disabled={ending}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {ending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              End Drill
            </button>
          )}
          {drillStatus === 'COMPLETED' && (
            <a
              href={`/emergency/drills/${drillId}/scorecard`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              View Scorecard
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {[
          { key: 'timeline', label: 'Timeline', icon: Clock, count: actions.length },
          { key: 'killtasks', label: 'Kill Tasks', icon: CheckCircle2, count: killTasks.length },
          { key: 'muster', label: 'Muster Board', icon: Users, count: muster.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'timeline' | 'killtasks' | 'muster')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-white border-b-2 border-teal-500 bg-slate-800'
                : 'text-muted-foreground/70 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && (
              <span className="text-xs bg-slate-700 text-slate-300 px-1.5 rounded-full">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-700">
          <div className="p-4 max-h-80 overflow-y-auto space-y-2">
            {actions.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm">No actions logged yet.</div>
            ) : (
              actions.map((action) => {
                const Icon = ACTION_ICONS[action.actionType] ?? Clock;
                return (
                  <div
                    key={action.id}
                    className={`flex gap-2 p-2.5 rounded-lg border text-xs ${SEVERITY_COLORS[action.severity] ?? 'bg-slate-800 border-slate-700 text-slate-300'}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{action.actionType.replace(/_/g, ' ')}</span>
                        <span className="ml-auto text-slate-500 text-xs">{new Date(action.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-foreground/80 mt-0.5 leading-snug">{action.description}</p>
                      {(action.location || action.performedBy) && (
                        <div className="flex gap-2 mt-0.5 text-slate-500">
                          {action.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{action.location}</span>}
                          {action.performedBy && <span> {action.performedBy}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={submitAction} className="p-4 space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Log Action</p>
            <select
              value={logForm.actionType}
              onChange={(e) => setLogForm((f) => ({ ...f, actionType: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {ACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <textarea
              placeholder="Description"
              required
              value={logForm.description}
              onChange={(e) => setLogForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={logForm.severity}
                onChange={(e) => setLogForm((f) => ({ ...f, severity: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <input
                placeholder="Performed by"
                value={logForm.performedBy}
                onChange={(e) => setLogForm((f) => ({ ...f, performedBy: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <input
              placeholder="Location (optional)"
              value={logForm.location}
              onChange={(e) => setLogForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={submitting || drillStatus !== 'IN_PROGRESS'}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Log Action
            </button>
          </form>
        </div>
      )}

      {/* Kill Tasks Tab */}
      {activeTab === 'killtasks' && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {killTasks.length === 0 && !showTaskForm && (
            <div className="text-center text-slate-500 py-6 text-sm">No kill tasks added yet.</div>
          )}
          {killTasks.map((task) => (
            <div key={task.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <div className="flex items-start justify-between px-4 pt-3 pb-2">
                <div>
                  <p className="font-bold text-sm text-white">{task.taskName}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{task.locationLabel}  {task.assignedRole}  {task.timeLimitMinutes}min limit</p>
                </div>
                <KillTaskBadge task={task} />
              </div>
              <div className="flex items-center gap-4 px-4 pb-3">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl(`${baseUrl}/drill-task/${task.qrToken}`)} alt="Task QR" className="w-16 h-16 object-contain" loading="lazy" />
                </div>
                <div className="text-xs text-muted-foreground/70 space-y-0.5">
                  <p className="flex items-center gap-1"><QrCode className="w-3 h-3" /> Print and post at {task.locationLabel}</p>
                  <p>Staff scan to confirm task complete</p>
                  {task.completedBy && <p className="text-emerald-400"> Completed by {task.completedBy}</p>}
                  {task.isMissed && <p className="text-red-400"> Time limit exceeded</p>}
                </div>
              </div>
            </div>
          ))}
          {showTaskForm ? (
            <form onSubmit={addKillTask} className="bg-slate-800 border border-slate-600 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">New Kill Task</p>
              <input required placeholder="Task name" value={taskForm.taskName}
                onChange={(e) => setTaskForm((f) => ({ ...f, taskName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Assigned role" value={taskForm.assignedRole}
                  onChange={(e) => setTaskForm((f) => ({ ...f, assignedRole: e.target.value }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                <input required placeholder="Location label" value={taskForm.locationLabel}
                  onChange={(e) => setTaskForm((f) => ({ ...f, locationLabel: e.target.value }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-xs text-muted-foreground/70 flex items-center gap-1">
                  Time limit (min)
                  <input type="number" min={1} max={60} value={taskForm.timeLimitMinutes}
                    onChange={(e) => setTaskForm((f) => ({ ...f, timeLimitMinutes: parseInt(e.target.value) || 3 }))}
                    className="w-14 ml-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <input type="checkbox" checked={taskForm.isRequired}
                    onChange={(e) => setTaskForm((f) => ({ ...f, isRequired: e.target.checked }))} />
                  Required for score
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addingTask}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5">
                  {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Task
                </button>
                <button type="button" onClick={() => setShowTaskForm(false)}
                  className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          ) : drillStatus === 'IN_PROGRESS' && (
            <button onClick={() => setShowTaskForm(true)}
              className="w-full border-2 border-dashed border-slate-700 hover:border-slate-600 text-muted-foreground/70 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Kill Task
            </button>
          )}
        </div>
      )}

      {/* Muster Board Tab */}
      {activeTab === 'muster' && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {muster.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground/70 mb-1">
                  <span>Live Accountability</span>
                  <span className="font-bold text-white">{accountedCount}/{muster.length} ({accountabilityPct}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${accountabilityPct >= 95 ? 'bg-emerald-500' : accountabilityPct >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${accountabilityPct}%` }} />
                </div>
              </div>
            </div>
          )}
          {muster.length === 0 && !showStaffForm && (
            <div className="text-center text-slate-500 py-6 text-sm">No staff on roster yet.</div>
          )}
          {muster.map((entry) => (
            <div key={entry.id} className="bg-slate-800 border border-slate-700 rounded-xl flex gap-3 p-3 items-start">
              <div className="w-14 h-14 bg-white rounded-lg flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl(`${baseUrl}/drill-muster/${entry.qrToken}`)} alt="Muster QR" className="w-14 h-14 object-contain" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-white truncate">{entry.staffName}</p>
                  <MusterBadge status={entry.status} />
                </div>
                {entry.staffRole && <p className="text-xs text-muted-foreground/70 truncate">{entry.staffRole}</p>}
                {entry.department && <p className="text-xs text-slate-500 truncate">{entry.department}</p>}
                {entry.musterPoint && (
                  <p className="text-xs text-slate-500 flex items-center gap-0.5 mt-0.5"><MapPin className="w-3 h-3" />{entry.musterPoint}</p>
                )}
                {entry.checkedInAt && <p className="text-xs text-emerald-400 mt-0.5"> {new Date(entry.checkedInAt).toLocaleTimeString()}</p>}
              </div>
              {drillStatus === 'IN_PROGRESS' && (
                <button onClick={() => removeStaff(entry.id)} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {showStaffForm ? (
            <form onSubmit={addStaff} className="bg-slate-800 border border-slate-600 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Add Staff to Roster</p>
              <input required placeholder="Full name" value={staffForm.staffName}
                onChange={(e) => setStaffForm((f) => ({ ...f, staffName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Role / title" value={staffForm.staffRole}
                  onChange={(e) => setStaffForm((f) => ({ ...f, staffRole: e.target.value }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                <input placeholder="Department" value={staffForm.department}
                  onChange={(e) => setStaffForm((f) => ({ ...f, department: e.target.value }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <input placeholder="Muster point (e.g. Parking Lot A)" value={staffForm.musterPoint}
                onChange={(e) => setStaffForm((f) => ({ ...f, musterPoint: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              <div className="flex gap-2">
                <button type="submit" disabled={addingStaff}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5">
                  {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add to Roster
                </button>
                <button type="button" onClick={() => setShowStaffForm(false)}
                  className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          ) : drillStatus === 'IN_PROGRESS' && (
            <button onClick={() => setShowStaffForm(true)}
              className="w-full border-2 border-dashed border-slate-700 hover:border-slate-600 text-muted-foreground/70 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff Member
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KillTaskBadge({ task }: { task: KillTask }) {
  if (task.completedAt && !task.isMissed)
    return <span className="text-xs bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-bold">DONE</span>;
  if (task.isMissed)
    return <span className="text-xs bg-red-800 text-red-300 px-2 py-0.5 rounded-full font-bold">MISSED</span>;
  return <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">PENDING</span>;
}

function MusterBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PRESENT: 'bg-emerald-700 text-emerald-200',
    GHOSTED: 'bg-red-800 text-red-200',
    EXCUSED: 'bg-blue-800 text-blue-200',
    UNACCOUNTED: 'bg-orange-800 text-orange-200',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${map[status] ?? 'bg-slate-700 text-slate-300'}`}>
      {status}
    </span>
  );
}
