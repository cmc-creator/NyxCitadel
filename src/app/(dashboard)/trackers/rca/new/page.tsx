'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function NewRcaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromIr    = searchParams.get('fromIr')    ?? '';
  const prefillDate = searchParams.get('date')    ? new Date(searchParams.get('date')!).toISOString().slice(0, 10) : '';
  const prefillType = searchParams.get('type')    ?? '';
  const prefillDesc = searchParams.get('desc')    ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'event' | 'factors' | 'analysis' | 'actions'>('event');

  const [whyItems, setWhyItems] = useState<WhyItem[]>([
    { id: crypto.randomUUID(), why: 'Why did this event occur?', answer: '' },
  ]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: crypto.randomUUID(), action: '', responsible: '', targetDate: '', status: 'OPEN' },
  ]);

  function addWhy() {
    const num = whyItems.length + 1;
    setWhyItems(prev => [...prev, {
      id: crypto.randomUUID(),
      why: `Why #${num}`,
      answer: '',
    }]);
  }

  function addAction() {
    setActionItems(prev => [...prev, { id: crypto.randomUUID(), action: '', responsible: '', targetDate: '', status: 'OPEN' }]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const data = {
      eventDate:              (f.elements.namedItem('eventDate') as HTMLInputElement).value,
      eventDescription:       (f.elements.namedItem('eventDescription') as HTMLTextAreaElement).value,
      eventType:              (f.elements.namedItem('eventType') as HTMLSelectElement).value,
      linkedIncidentId:       (f.elements.namedItem('linkedIncidentId') as HTMLInputElement).value || null,
      teamMembers:            (f.elements.namedItem('teamMembers') as HTMLTextAreaElement).value || null,
      completedBy:            (f.elements.namedItem('completedBy') as HTMLInputElement).value || null,
      conductedDate:          (f.elements.namedItem('conductedDate') as HTMLInputElement).value || null,
      eventTimeline:          (f.elements.namedItem('eventTimeline') as HTMLTextAreaElement).value || null,
      humanFactors:           (f.elements.namedItem('humanFactors') as HTMLTextAreaElement).value || null,
      equipmentFactors:       (f.elements.namedItem('equipmentFactors') as HTMLTextAreaElement).value || null,
      environmentFactors:     (f.elements.namedItem('environmentFactors') as HTMLTextAreaElement).value || null,
      processFactors:         (f.elements.namedItem('processFactors') as HTMLTextAreaElement).value || null,
      organizationalFactors:  (f.elements.namedItem('organizationalFactors') as HTMLTextAreaElement).value || null,
      whyAnalysis:            whyItems.filter(w => w.answer).map(({ id: _id, ...rest }) => rest),
      rootCauses:             (f.elements.namedItem('rootCauses') as HTMLTextAreaElement).value
                                ? [(f.elements.namedItem('rootCauses') as HTMLTextAreaElement).value]
                                : null,
      actionItems:            actionItems.filter(a => a.action).map(({ id: _id, ...rest }) => rest),
      conclusion:             (f.elements.namedItem('conclusion') as HTMLTextAreaElement).value || null,
      preventabilityRating:   (f.elements.namedItem('preventabilityRating') as HTMLSelectElement).value || null,
      systemChangesRequired:  (f.elements.namedItem('systemChangesRequired') as HTMLInputElement).checked,
      policyChangesRequired:  (f.elements.namedItem('policyChangesRequired') as HTMLInputElement).checked,
      trainingRequired:       (f.elements.namedItem('trainingRequired') as HTMLInputElement).checked,
      notes:                  (f.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/rca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/rca');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save RCA.');
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
        <a href="/trackers/rca" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to RCAs
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-teal-600" />
          New Root Cause Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          JC LD.04.04.05 - Complete RCA for sentinel events using the 5-Whys methodology.
        </p>
      </div>

      {fromIr && (
        <div className="flex items-center gap-2 bg-teal-950/20 border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-indigo-700">
          <Search className="w-4 h-4 shrink-0" />
          Pre-filled from Incident Report. Review and complete all sections below.
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-teal-600/20 text-teal-300 shadow-sm' : 'text-slate-500 hover:text-foreground/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
                  defaultValue={prefillDate}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Event Type *</label>
                <select
                  name="eventType"
                  required
                  defaultValue={prefillType}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Led By</label>
                <input
                  name="completedBy"
                  placeholder="Name / title"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/80 mb-1">Linked Incident ID</label>
                <input
                  name="linkedIncidentId"
                  placeholder="Incident record ID (if applicable)"
                  defaultValue={fromIr}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Event Description *</label>
              <textarea
                name="eventDescription"
                required
                rows={4}
                defaultValue={prefillDesc}
                placeholder="Describe what happened - what was the adverse event or sentinel event?"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Event Timeline</label>
              <textarea
                name="eventTimeline"
                rows={5}
                placeholder="Chronological timeline of events leading up to and following the incident..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">RCA Team Members</label>
              <textarea
                name="teamMembers"
                rows={2}
                placeholder="Names and roles of team members who participated in the RCA..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Contributing Factors */}
        {activeTab === 'factors' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Contributing Factors (JC Framework)</h2>
            <p className="text-xs text-slate-500">Identify contributing factors in each category. Not all categories may apply.</p>

            {[
              { name: 'humanFactors',          label: 'Human Factors',          placeholder: 'Staff performance, communication, training, fatigue, supervision...' },
              { name: 'processFactors',         label: 'Process / Workflow',     placeholder: 'Workflow breakdowns, policy gaps, procedure failures...' },
              { name: 'environmentFactors',     label: 'Environment',            placeholder: 'Physical environment issues, space, lighting, equipment placement...' },
              { name: 'equipmentFactors',       label: 'Equipment / Technology', placeholder: 'Device failures, missing equipment, technology issues...' },
              { name: 'organizationalFactors',  label: 'Organizational',         placeholder: 'Leadership decisions, culture, resource allocation, staffing levels...' },
            ].map(factor => (
              <div key={factor.name}>
                <label className="block text-sm font-medium text-foreground/80 mb-1">{factor.label}</label>
                <textarea
                  name={factor.name}
                  rows={2}
                  placeholder={factor.placeholder}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => setWhyItems(prev => prev.map(w => w.id === item.id ? { ...w, answer: e.target.value } : w))}
                    rows={2}
                    placeholder="Answer..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Root Causes Identified</h2>
              <textarea
                name="rootCauses"
                rows={4}
                placeholder="Based on the 5-Whys analysis, what are the identified root causes?"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Conclusion & Preventability</h2>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Preventability Rating</label>
                <select
                  name="preventabilityRating"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                placeholder="Overall conclusion of the RCA..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/80">Required Changes</p>
                {[
                  { name: 'systemChangesRequired',  label: 'System or process changes required' },
                  { name: 'policyChangesRequired',   label: 'Policy or procedure changes required' },
                  { name: 'trainingRequired',        label: 'Staff training / education required' },
                ].map(c => (
                  <label key={c.name} className="flex items-center gap-3 cursor-pointer">
                    <input
                      name={c.name}
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-foreground/80">{c.label}</span>
                  </label>
                ))}
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
                  <span className="text-sm font-semibold text-slate-600">Action #{idx + 1}</span>
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
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={item.responsible}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, responsible: e.target.value } : a))}
                    placeholder="Responsible party"
                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="date"
                    value={item.targetDate}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, targetDate: e.target.value } : a))}
                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Any additional notes..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Root Cause Analysis'}
          </button>
          <a
            href="/trackers/rca"
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
