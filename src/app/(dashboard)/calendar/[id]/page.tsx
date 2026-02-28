'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CalendarDays, ArrowLeft, CheckCircle2, PencilLine,
  Trash2, Loader2, AlertCircle, X, Save, Clock,
  AlertTriangle, Flag, BookOpen, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  regulatoryBody: string | null;
  dueDate: string;
  completedDate: string | null;
  status: string;
  priority: string;
  notes: string | null;
  documentUrl: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING:    'bg-blue-100   text-blue-800',
  IN_PROGRESS: 'bg-amber-100  text-amber-800',
  COMPLETED:   'bg-green-100  text-green-800',
  OVERDUE:     'bg-red-100    text-red-800',
  WAIVED:      'bg-slate-100  text-slate-700',
  NA:          'bg-gray-100   text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-600',
  HIGH:     'text-orange-500',
  MEDIUM:   'text-amber-500',
  LOW:      'text-slate-400',
};

const REGULATORY_BODIES = [
  'JOINT_COMMISSION','CMS','AZ_ADHS','AZ_BOMEX','AZ_BON',
  'AZ_BPPE','DEA','OSHA','EPA','TJC_PATHWAYS','CARF','DNV',
  'NCQA','SAMHSA','INTERNAL','OTHER','',
];

const PRIORITY_LEVELS = ['CRITICAL','HIGH','MEDIUM','LOW'];
const STATUSES        = ['UPCOMING','IN_PROGRESS','COMPLETED','OVERDUE','WAIVED','NA'];

const EVENT_CATEGORIES = [
  'EM_COMMITTEE_MEETING','HVA_ASSESSMENT','TABLETOP_EXERCISE','FUNCTIONAL_DRILL','FULL_SCALE_DRILL',
  'EM_PLAN_REVIEW','AFTER_ACTION_REVIEW','COMMUNITY_PARTNER_MEETING',
  'JC_SURVEY_PREP','JC_TRACER','JC_EC_ROUNDS','JC_MOCK_SURVEY','JC_STANDARDS_REVIEW','JC_PI_MEETING',
  'CMS_SURVEY_PREP','CMS_MOCK_SURVEY','CMS_QAPI_MEETING','CMS_CONDITIONS_REVIEW',
  'AZ_LICENSE_RENEWAL','AZ_ADHS_SURVEY','AZ_INSPECTION','AZ_REPORT_SUBMISSION','AZ_BEHAVIORAL_HEALTH_REVIEW',
  'FIRE_MARSHAL_INSPECTION','LIFE_SAFETY_ROUNDS','UTILITY_MANAGEMENT_TEST','MEDICAL_EQUIPMENT_PM',
  'EOC_COMMITTEE_MEETING','FIRE_EXTINGUISHER_INSPECTION','SPRINKLER_INSPECTION','FIRE_ALARM_TEST',
  'GENERATOR_TEST','BACKFLOW_PREVENTER_TEST','ELEVATOR_INSPECTION',
  'IC_COMMITTEE_MEETING','IC_RISK_ASSESSMENT','IC_SURVEILLANCE_REVIEW','HAND_HYGIENE_AUDIT',
  'QAPI_MEETING','PEER_REVIEW','UTILIZATION_REVIEW','PATIENT_SATISFACTION_REVIEW','MORTALITY_REVIEW',
  'POLICY_REVIEW','STAFF_TRAINING','COMPETENCY_ASSESSMENT','ANNUAL_EVALUATION','MANDATORY_EDUCATION',
  'MEDICATION_MANAGEMENT_REVIEW','FORMULARY_REVIEW','CONTROLLED_SUBSTANCE_AUDIT','PHARMACY_INSPECTION',
  'PATIENT_RIGHTS_REVIEW','ETHICS_COMMITTEE_MEETING','INFORMED_CONSENT_AUDIT',
  'BOARD_MEETING','MEDICAL_STAFF_MEETING','CREDENTIALING_REVIEW','BYLAWS_REVIEW','OTHER',
];

function fmtCat(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function isOverdue(ev: CalendarEvent) {
  return !ev.completedDate && new Date(ev.dueDate) < new Date() && ev.status !== 'COMPLETED' && ev.status !== 'WAIVED' && ev.status !== 'NA';
}

export default function CalendarEventDetailPage() {
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const id       = params.id;

  const [event, setEvent]       = useState<CalendarEvent | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [flash, setFlash]       = useState('');

  // Edit form state
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', category: '',
    regulatoryBody: '', priority: '', status: '', notes: '', documentUrl: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/calendar/${id}`);
    if (!res.ok) { setError('Event not found.'); setLoading(false); return; }
    const ev = await res.json() as CalendarEvent;
    setEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      dueDate: ev.dueDate.slice(0, 10),
      category: ev.category,
      regulatoryBody: ev.regulatoryBody ?? '',
      priority: ev.priority,
      status: ev.status,
      notes: ev.notes ?? '',
      documentUrl: ev.documentUrl ?? '',
    });
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function markComplete() {
    setSaving(true);
    const res = await fetch(`/api/calendar/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', completedDate: new Date().toISOString() }),
    });
    if (res.ok) { setFlash('Marked as complete!'); await load(); }
    setSaving(false);
  }

  async function saveEdit() {
    setSaving(true);
    const body: Record<string, string | null> = {
      title: form.title,
      description: form.description || null,
      dueDate: form.dueDate,
      category: form.category,
      regulatoryBody: form.regulatoryBody || null,
      priority: form.priority,
      status: form.status,
      notes: form.notes || null,
      documentUrl: form.documentUrl || null,
    };
    const res = await fetch(`/api/calendar/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { setEditing(false); setFlash('Changes saved.'); await load(); }
    else { setFlash('Save failed — please try again.'); }
    setSaving(false);
  }

  async function deleteEvent() {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
    router.push('/calendar');
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-10">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading event…
    </div>
  );

  if (error || !event) return (
    <div className="flex flex-col items-center gap-4 py-16 text-slate-500">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p>{error || 'Event not found.'}</p>
      <Link href="/calendar" className="text-purple-600 hover:underline text-sm">← Back to Calendar</Link>
    </div>
  );

  const overdue = isOverdue(event);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/calendar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Calendar
      </Link>

      {/* Flash */}
      {flash && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> {flash}
          <button onClick={() => setFlash('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <CalendarDays className="w-8 h-8 text-purple-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {!editing ? (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] ?? 'bg-slate-100 text-slate-700'}`}>
                    {event.status.replace(/_/g, ' ')}
                  </span>
                  {overdue && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> OVERDUE
                    </span>
                  )}
                  <span className={`text-xs font-semibold flex items-center gap-1 ${PRIORITY_COLORS[event.priority]}`}>
                    <Flag className="w-3 h-3" /> {event.priority}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">{event.title}</h1>
                {event.description && <p className="text-sm text-slate-600 mt-1">{event.description}</p>}
              </>
            ) : (
              <div className="space-y-3 w-full">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <textarea rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        {!editing && (
          <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-t border-slate-100 pt-5">
            <div>
              <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Due Date</dt>
              <dd className={`mt-0.5 font-semibold ${overdue ? 'text-red-700' : 'text-slate-900'}`}>{fmtDate(event.dueDate)}</dd>
            </div>
            {event.completedDate && (
              <div>
                <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Completed</dt>
                <dd className="mt-0.5 font-semibold text-green-700">{fmtDate(event.completedDate)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Category</dt>
              <dd className="mt-0.5 text-slate-700">{fmtCat(event.category)}</dd>
            </div>
            {event.regulatoryBody && (
              <div>
                <dt className="text-xs font-medium text-slate-500">Regulatory Body</dt>
                <dd className="mt-0.5 text-slate-700">{event.regulatoryBody.replace(/_/g, ' ')}</dd>
              </div>
            )}
            {event.notes && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-slate-500">Notes</dt>
                <dd className="mt-0.5 text-slate-700 whitespace-pre-wrap">{event.notes}</dd>
              </div>
            )}
            {event.documentUrl && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-slate-500">Reference Document</dt>
                <dd className="mt-0.5">
                  <a href={event.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-purple-600 hover:underline text-sm">
                    <ExternalLink className="w-3.5 h-3.5" /> View Document
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* Edit form fields */}
        {editing && (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date *</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{fmtCat(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITY_LEVELS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.regulatoryBody} onChange={e => setForm(f => ({ ...f, regulatoryBody: e.target.value }))}>
                {REGULATORY_BODIES.map(b => <option key={b} value={b}>{b ? b.replace(/_/g, ' ') : '— None —'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Document URL</label>
              <input type="url" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.documentUrl} onChange={e => setForm(f => ({ ...f, documentUrl: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3 flex-wrap border-t border-slate-100 pt-5">
          {!editing && event.status !== 'COMPLETED' && (
            <button
              onClick={markComplete}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Mark Complete
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 border border-slate-300 hover:border-purple-400 text-slate-700 hover:text-purple-700 text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <PencilLine className="w-4 h-4" /> Edit Event
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button onClick={() => { setEditing(false); void load(); }} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                Cancel
              </button>
            </>
          )}
          <button
            onClick={deleteEvent}
            disabled={deleting}
            className="flex items-center gap-2 ml-auto text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
