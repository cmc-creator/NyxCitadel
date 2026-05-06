'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { AiFieldHelper } from '@/components/ai/AiFieldHelper';
import { SentryPageGuide } from '@/components/ai/SentryPageGuide';

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
  const fromIr      = searchParams.get('fromIr')   ?? '';
  const prefillDate = searchParams.get('date')      ? new Date(searchParams.get('date')!).toISOString().slice(0, 10) : '';
  const prefillType = searchParams.get('type')      ?? '';
  const prefillDesc = searchParams.get('desc')      ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'event' | 'factors' | 'analysis' | 'actions'>('event');
  const [eventType, setEventType] = useState(prefillType);

  // Controlled textarea values for AI assistance
  const [eventDescription, setEventDescription] = useState(prefillDesc);
  const [eventTimeline, setEventTimeline] = useState('');
  const [humanFactors, setHumanFactors] = useState('');
  const [processFactors, setProcessFactors] = useState('');
  const [environmentFactors, setEnvironmentFactors] = useState('');
  const [equipmentFactors, setEquipmentFactors] = useState('');
  const [organizationalFactors, setOrganizationalFactors] = useState('');
  const [rootCauses, setRootCauses] = useState('');
  const [conclusion, setConclusion] = useState('');

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
      eventDate:             (f.elements.namedItem('eventDate') as HTMLInputElement).value,
      eventDescription,
      eventType,
      linkedIncidentId:      (f.elements.namedItem('linkedIncidentId') as HTMLInputElement).value || null,
      teamMembers:           (f.elements.namedItem('teamMembers') as HTMLTextAreaElement).value || null,
      completedBy:           (f.elements.namedItem('completedBy') as HTMLInputElement).value || null,
      conductedDate:         (f.elements.namedItem('conductedDate') as HTMLInputElement).value || null,
      eventTimeline:         eventTimeline || null,
      humanFactors:          humanFactors || null,
      equipmentFactors:      equipmentFactors || null,
      environmentFactors:    environmentFactors || null,
      processFactors:        processFactors || null,
      organizationalFactors: organizationalFactors || null,
      whyAnalysis:           whyItems.filter(w => w.answer).map(({ id: _, ...rest }) => rest),
      rootCauses:            rootCauses ? [rootCauses] : null,
      actionItems:           actionItems.filter(a => a.action).map(({ id: _, ...rest }) => rest),
      conclusion:            conclusion || null,
      preventabilityRating:  (f.elements.namedItem('preventabilityRating') as HTMLSelectElement).value || null,
      systemChangesRequired: (f.elements.namedItem('systemChangesRequired') as HTMLInputElement).checked,
      policyChangesRequired: (f.elements.namedItem('policyChangesRequired') as HTMLInputElement).checked,
      trainingRequired:      (f.elements.namedItem('trainingRequired') as HTMLInputElement).checked,
      notes:                 (f.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
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

  const rcaHints = {
    eventType,
    eventDescription: eventDescription.slice(0, 200),
  };

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

      <SentryPageGuide
        pageKey="rca-new"
        title="Root Cause Analysis"
        body="An RCA uncovers why an event happened so it can be prevented. Work through each tab: describe the event, identify contributing factors across 5 categories, run the 5-Whys drill-down, then define action items. Use the sparkle button on any text field to get Sentry's help."
        tips={[
          "Contributing factors are not root causes -- they are conditions that made the event possible",
          "5-Whys: keep asking 'why' until you reach a system or process failure, not a person",
          "Each root cause should have at least one specific action item with an owner and due date",
          "JC requires RCA for all sentinel events within 45 days of discovery",
        ]}
      />

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
              activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-foreground/80'
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Event Type *</label>
                <select
                  name="eventType"
                  required
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Led By</label>
                <input
                  name="completedBy"
                  placeholder="Name / title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/80 mb-1">Linked Incident ID</label>
                <input
                  name="linkedIncidentId"
                  placeholder="Incident record ID (if applicable)"
                  defaultValue={fromIr}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <AiFieldHelper
              fieldLabel="Event Description"
              pageContext="Root Cause Analysis"
              value={eventDescription}
              onChange={setEventDescription}
              rows={4}
              required
              name="eventDescription"
              placeholder="Describe what happened - what was the adverse event or sentinel event?"
              formHints={{ eventType }}
            />

            <AiFieldHelper
              fieldLabel="Event Timeline"
              pageContext="Root Cause Analysis"
              value={eventTimeline}
              onChange={setEventTimeline}
              rows={5}
              name="eventTimeline"
              placeholder="Chronological timeline of events leading up to and following the incident..."
              formHints={rcaHints}
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">RCA Team Members</label>
              <textarea
                name="teamMembers"
                rows={2}
                placeholder="Names and roles of team members who participated in the RCA..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Contributing Factors */}
        {activeTab === 'factors' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Contributing Factors (JC Framework)</h2>
            <p className="text-xs text-slate-500">Identify contributing factors in each category. Not all categories may apply. Use Sentry to help draft each one.</p>

            <AiFieldHelper
              fieldLabel="Human Factors"
              pageContext="Root Cause Analysis - Contributing Factors"
              value={humanFactors}
              onChange={setHumanFactors}
              rows={2}
              name="humanFactors"
              placeholder="Staff performance, communication, training, fatigue, supervision..."
              formHints={rcaHints}
            />
            <AiFieldHelper
              fieldLabel="Process / Workflow Factors"
              pageContext="Root Cause Analysis - Contributing Factors"
              value={processFactors}
              onChange={setProcessFactors}
              rows={2}
              name="processFactors"
              placeholder="Workflow breakdowns, policy gaps, procedure failures..."
              formHints={rcaHints}
            />
            <AiFieldHelper
              fieldLabel="Environment Factors"
              pageContext="Root Cause Analysis - Contributing Factors"
              value={environmentFactors}
              onChange={setEnvironmentFactors}
              rows={2}
              name="environmentFactors"
              placeholder="Physical environment issues, space, lighting, equipment placement..."
              formHints={rcaHints}
            />
            <AiFieldHelper
              fieldLabel="Equipment / Technology Factors"
              pageContext="Root Cause Analysis - Contributing Factors"
              value={equipmentFactors}
              onChange={setEquipmentFactors}
              rows={2}
              name="equipmentFactors"
              placeholder="Device failures, missing equipment, technology issues..."
              formHints={rcaHints}
            />
            <AiFieldHelper
              fieldLabel="Organizational Factors"
              pageContext="Root Cause Analysis - Contributing Factors"
              value={organizationalFactors}
              onChange={setOrganizationalFactors}
              rows={2}
              name="organizationalFactors"
              placeholder="Leadership decisions, culture, resource allocation, staffing levels..."
              formHints={rcaHints}
            />
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => setWhyItems(prev => prev.map(w => w.id === item.id ? { ...w, answer: e.target.value } : w))}
                    rows={2}
                    placeholder="Answer..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Root Causes Identified</h2>
              <AiFieldHelper
                fieldLabel="Root Causes"
                pageContext="Root Cause Analysis - Root Causes Identified"
                value={rootCauses}
                onChange={setRootCauses}
                rows={4}
                name="rootCauses"
                placeholder="Based on the 5-Whys analysis, what are the identified root causes?"
                formHints={{
                  ...rcaHints,
                  humanFactors: humanFactors.slice(0, 100),
                  processFactors: processFactors.slice(0, 100),
                }}
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Conclusion &amp; Preventability</h2>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Preventability Rating</label>
                <select
                  name="preventabilityRating"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select...</option>
                  <option value="Preventable">Preventable</option>
                  <option value="Possibly preventable">Possibly Preventable</option>
                  <option value="Not preventable">Not Preventable</option>
                </select>
              </div>

              <AiFieldHelper
                fieldLabel="Conclusion"
                pageContext="Root Cause Analysis - Conclusion"
                value={conclusion}
                onChange={setConclusion}
                rows={3}
                name="conclusion"
                placeholder="Overall conclusion of the RCA..."
                formHints={{
                  ...rcaHints,
                  rootCauses: rootCauses.slice(0, 200),
                }}
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={item.responsible}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, responsible: e.target.value } : a))}
                    placeholder="Responsible party"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="date"
                    value={item.targetDate}
                    onChange={e => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, targetDate: e.target.value } : a))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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
