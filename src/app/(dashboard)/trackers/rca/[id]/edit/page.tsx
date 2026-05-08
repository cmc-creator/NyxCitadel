'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface WhyItem {
  id: string;
  why: string;
  answer: string;
}

interface ActionItem {
  id: string;
  action: string;
  responsible: string;
  targetDate: string;
  status: string;
}

const EVENT_TYPES = [
  'Sentinel Event',
  'Serious Adverse Event',
  'Near Miss / Close Call',
  'Patient Death',
  'Patient Harm',
  'Medication Error (Serious)',
  'Elopement',
  'Suicide / Suicide Attempt',
  'Assault / Violence',
  'Fall with Injury',
  'Alleged Abuse/Neglect',
  'Equipment Failure',
  'Other',
];

export default function EditRcaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'event' | 'factors' | 'analysis' | 'actions'>('event');

  const [whyItems, setWhyItems] = useState<WhyItem[]>([
    { id: crypto.randomUUID(), why: 'Why did this event occur?', answer: '' },
  ]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: crypto.randomUUID(), action: '', responsible: '', targetDate: '', status: 'OPEN' },
  ]);

  const [systemChangesRequired, setSystemChangesRequired] = useState(false);
  const [policyChangesRequired, setPolicyChangesRequired] = useState(false);
  const [trainingRequired, setTrainingRequired] = useState(false);

  useEffect(() => {
    fetch(`/api/rca/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSystemChangesRequired(d.systemChangesRequired ?? false);
        setPolicyChangesRequired(d.policyChangesRequired ?? false);
        setTrainingRequired(d.trainingRequired ?? false);
        if (d.whyAnalysis && d.whyAnalysis.length > 0) {
          setWhyItems(d.whyAnalysis.map((w: any) => ({
            id: crypto.randomUUID(),
            why: w.why ?? '',
            answer: w.answer ?? '',
          })));
        }
        if (d.actionItems && d.actionItems.length > 0) {
          setActionItems(d.actionItems.map((a: any) => ({
            id: crypto.randomUUID(),
            action: a.action ?? '',
            responsible: a.responsible ?? '',
            targetDate: a.targetDate ? a.targetDate.split('T')[0] : '',
            status: a.status ?? 'OPEN',
          })));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  function addWhy() {
    const num = whyItems.length + 1;
    setWhyItems(prev => [...prev, { id: crypto.randomUUID(), why: `Why #${num}`, answer: '' }]);
  }

  function addAction() {
    setActionItems(prev => [...prev, { id: crypto.randomUUID(), action: '', responsible: '', targetDate: '', status: 'OPEN' }]);
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const payload = {
      eventDate:             (f.elements.namedItem('eventDate') as HTMLInputElement).value,
      eventDescription:      (f.elements.namedItem('eventDescription') as HTMLTextAreaElement).value,
      eventType:             (f.elements.namedItem('eventType') as HTMLSelectElement).value,
      linkedIncidentId:      (f.elements.namedItem('linkedIncidentId') as HTMLInputElement).value || null,
      teamMembers:           (f.elements.namedItem('teamMembers') as HTMLTextAreaElement)?.value || null,
      completedBy:           (f.elements.namedItem('completedBy') as HTMLInputElement)?.value || null,
      conductedDate:         (f.elements.namedItem('conductedDate') as HTMLInputElement)?.value || null,
      eventTimeline:         (f.elements.namedItem('eventTimeline') as HTMLTextAreaElement)?.value || null,
      humanFactors:          (f.elements.namedItem('humanFactors') as HTMLTextAreaElement)?.value || null,
      equipmentFactors:      (f.elements.namedItem('equipmentFactors') as HTMLTextAreaElement)?.value || null,
      environmentFactors:    (f.elements.namedItem('environmentFactors') as HTMLTextAreaElement)?.value || null,
      processFactors:        (f.elements.namedItem('processFactors') as HTMLTextAreaElement)?.value || null,
      organizationalFactors: (f.elements.namedItem('organizationalFactors') as HTMLTextAreaElement)?.value || null,
      whyAnalysis:           whyItems.filter(w => w.answer).map(({ id: _id, ...rest }) => rest),
      rootCauses:            (f.elements.namedItem('rootCauses') as HTMLTextAreaElement)?.value
                               ? [(f.elements.namedItem('rootCauses') as HTMLTextAreaElement).value]
                               : null,
      actionItems:           actionItems.filter(a => a.action).map(({ id: _id, ...rest }) => rest),
      conclusion:            (f.elements.namedItem('conclusion') as HTMLTextAreaElement)?.value || null,
      preventabilityRating:  (f.elements.namedItem('preventabilityRating') as HTMLSelectElement)?.value || null,
      systemChangesRequired,
      policyChangesRequired,
      trainingRequired,
      notes:                 (f.elements.namedItem('notes') as HTMLTextAreaElement)?.value || null,
    };

    const res = await fetch(`/api/rca/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/rca/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to update.');
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'event',    label: '1. Event' },
    { id: 'factors',  label: '2. Contributing Factors' },
    { id: 'analysis', label: '3. Root Causes (5-Whys)' },
    { id: 'actions',  label: '4. Action Items' },
  ] as const;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href={`/trackers/rca/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-teal-600" />
          Edit Root Cause Analysis
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form key={data.id} onSubmit={handleSubmit} className="space-y-5">
        {/* Tab 1: Event */}
        {activeTab === 'event' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Event Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Event Date *</label>
                <input
                  name="eventDate"
                  type="date"
                  required
                  defaultValue={data.eventDate ? data.eventDate.split('T')[0] : ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Event Type *</label>
                <select
                  name="eventType"
                  required
                  defaultValue={data.eventType}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select type...</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">RCA Conducted Date</label>
                <input
                  name="conductedDate"
                  type="date"
                  defaultValue={data.conductedDate ? data.conductedDate.split('T')[0] : ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Led By</label>
                <input
                  name="completedBy"
                  defaultValue={data.completedBy ?? ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/80 mb-1">Linked Incident ID</label>
                <input
                  name="linkedIncidentId"
                  defaultValue={data.linkedIncidentId ?? ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Event Description *</label>
              <textarea
                name="eventDescription"
                required
                rows={4}
                defaultValue={data.eventDescription ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Event Timeline</label>
              <textarea
                name="eventTimeline"
                rows={5}
                defaultValue={data.eventTimeline ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">RCA Team Members</label>
              <textarea
                name="teamMembers"
                rows={2}
                defaultValue={data.teamMembers ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Contributing Factors */}
        {activeTab === 'factors' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Contributing Factors (JC Framework)</h2>
            <p className="text-xs text-muted-foreground">Identify contributing factors in each category. Not all categories may apply.</p>

            {[
              { name: 'humanFactors',          label: 'Human Factors',          placeholder: 'Staff performance, communication, training, fatigue, supervision...', defaultValue: data.humanFactors ?? '' },
              { name: 'processFactors',         label: 'Process / Workflow',     placeholder: 'Workflow breakdowns, policy gaps, procedure failures...', defaultValue: data.processFactors ?? '' },
              { name: 'environmentFactors',     label: 'Environment',            placeholder: 'Physical environment issues, space, lighting, equipment placement...', defaultValue: data.environmentFactors ?? '' },
              { name: 'equipmentFactors',       label: 'Equipment / Technology', placeholder: 'Device failures, missing equipment, technology issues...', defaultValue: data.equipmentFactors ?? '' },
              { name: 'organizationalFactors',  label: 'Organizational',         placeholder: 'Leadership decisions, culture, resource allocation, staffing levels...', defaultValue: data.organizationalFactors ?? '' },
            ].map(factor => (
              <div key={factor.name}>
                <label className="block text-sm font-medium text-foreground/80 mb-1">{factor.label}</label>
                <textarea
                  name={factor.name}
                  rows={2}
                  placeholder={factor.placeholder}
                  defaultValue={factor.defaultValue}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: 5-Whys */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">5-Whys Analysis</h2>
                <button
                  type="button"
                  onClick={addWhy}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-teal-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Why
                </button>
              </div>

              {whyItems.map((item, idx) => (
                <div key={item.id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-700">Why #{idx + 1}</span>
                    {whyItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setWhyItems(prev => prev.filter(w => w.id !== item.id))}
                        className="text-muted-foreground/70 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    value={item.why}
                    onChange={e => setWhyItems(prev => prev.map(w => w.id === item.id ? { ...w, why: e.target.value } : w))}
                    placeholder="Why question..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => setWhyItems(prev => prev.map(w => w.id === item.id ? { ...w, answer: e.target.value } : w))}
                    rows={2}
                    placeholder="Answer..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Root Causes Identified</h2>
              <textarea
                name="rootCauses"
                rows={4}
                defaultValue={Array.isArray(data.rootCauses) ? data.rootCauses.join('\n') : (data.rootCauses ?? '')}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Conclusion &amp; Preventability</h2>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Preventability Rating</label>
                <select
                  name="preventabilityRating"
                  defaultValue={data.preventabilityRating ?? ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="Preventable">Preventable</option>
                  <option value="Possibly preventable">Possibly Preventable</option>
                  <option value="Not preventable">Not Preventable</option>
                </select>
              </div>

              <textarea
                name="conclusion"
                rows={3}
                defaultValue={data.conclusion ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/80">Required Changes</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemChangesRequired}
                    onChange={e => setSystemChangesRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground/80">System or process changes required</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyChangesRequired}
                    onChange={e => setPolicyChangesRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground/80">Policy or procedure changes required</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trainingRequired}
                    onChange={e => setTrainingRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground/80">Staff training / education required</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Action Items */}
        {activeTab === 'actions' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Action Items</h2>
              <button
                type="button"
                onClick={addAction}
                className="inline-flex items-center gap-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add Action
              </button>
            </div>

            {actionItems.map((item, idx) => (
              <div key={item.id} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Action #{idx + 1}</span>
                  {actionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setActionItems(prev => prev.filter(a => a.id !== item.id))}
                      className="text-muted-foreground/70 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={item.action}
                  onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, action: e.target.value } : a))}
                  rows={2}
                  placeholder="Action item description..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={item.responsible}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, responsible: e.target.value } : a))}
                    placeholder="Responsible party"
                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="date"
                    value={item.targetDate}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, targetDate: e.target.value } : a))}
                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={data.notes ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <a
            href={`/trackers/rca/${id}`}
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-muted/20 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
