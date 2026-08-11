'use client';

import { useState } from 'react';
import { Download, Save, Loader2 } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  incidentDate: string;
  eventCategory: string;
  severity: string;
}

interface Props { incidents: Incident[] }

function buildPackageText(selected: Incident, form: Record<string, string>): string {
  return `JOINT COMMISSION SENTINEL EVENT SELF-DISCLOSURE PACKAGE
=========================================================

FACILITY INFORMATION
--------------------
Facility Name:   ${form.facilityName ?? ''}
Contact Name:    ${form.contactName ?? ''}
Contact Phone:   ${form.contactPhone ?? ''}
Contact Email:   ${form.contactEmail ?? ''}

EVENT INFORMATION
-----------------
Event Title:         ${selected.title}
Event Date:          ${new Date(selected.incidentDate).toLocaleDateString()}
Event Category:      ${selected.eventCategory}
Severity:            ${selected.severity}
Internal ID:         ${selected.id}

EVENT DESCRIPTION
-----------------
${form.eventDescription ?? ''}

ROOT CAUSE ANALYSIS SUMMARY
----------------------------
RCA Completion Date: ${form.rcaDate ?? ''}
Contributing Factors:
${form.contributingFactors ?? ''}

ACTION PLAN
-----------
${form.actionPlan ?? ''}

Action Plan Implementation Date: ${form.implementationDate ?? ''}
Responsible Party: ${form.responsibleParty ?? ''}

OUTCOME MONITORING
------------------
How will effectiveness be monitored:
${form.monitoring ?? ''}

==========================================
Generated: ${new Date().toISOString()}
This document is prepared for voluntary self-disclosure to the Joint Commission.
Submit via: https://www.jointcommission.org/resources/sentinel-event/
`;
}

export function SentinelPackageBuilder({ incidents }: Props) {
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm]             = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);

  const selected = incidents.find(i => i.id === selectedId);

  function setField(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function exportPackage() {
    if (!selected) { alert('Select an incident first.'); return; }
    const text = buildPackageText(selected, form);
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `JC_Sentinel_${selected.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveDraft() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetch('/api/regulatory-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'JC_SENTINEL_EVENT',
          reportingPeriod: new Date().toISOString().slice(0, 7),
          status: 'DRAFT',
          data: { incidentId: selectedId, ...form },
        }),
      });
    } catch { /* silent */ } finally { setSaving(false); }
  }

  const FIELDS: { key: string; label: string; rows?: number }[] = [
    { key: 'facilityName',        label: 'Facility Name' },
    { key: 'contactName',         label: 'Contact Name' },
    { key: 'contactPhone',        label: 'Contact Phone' },
    { key: 'contactEmail',        label: 'Contact Email' },
    { key: 'eventDescription',    label: 'Event Description', rows: 4 },
    { key: 'rcaDate',             label: 'RCA Completion Date (YYYY-MM-DD)' },
    { key: 'contributingFactors', label: 'Contributing Factors Identified', rows: 4 },
    { key: 'actionPlan',          label: 'Action Plan', rows: 5 },
    { key: 'implementationDate',  label: 'Action Plan Implementation Date' },
    { key: 'responsibleParty',    label: 'Responsible Party / Title' },
    { key: 'monitoring',          label: 'Effectiveness Monitoring Method', rows: 3 },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <h2 className="text-sm font-semibold text-foreground">Build Disclosure Package</h2>

      {incidents.length === 0 ? (
        <p className="text-sm text-slate-500">No JC-reportable incidents available. Flag incidents in the Incident Tracker first.</p>
      ) : (
        <>
          {/* Select incident */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Select Incident <span className="text-red-400">*</span></label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">- Select sentinel event -</option>
              {incidents.map(i => (
                <option key={i.id} value={i.id}>
                  {i.title} ({new Date(i.incidentDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {FIELDS.filter(f => !f.rows).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key] ?? ''}
                      onChange={e => setField(f.key, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>

              {FIELDS.filter(f => f.rows).map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
                  <textarea
                    rows={f.rows}
                    value={form[f.key] ?? ''}
                    onChange={e => setField(f.key, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3">
                <button
                  onClick={saveDraft}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-slate-300 hover:text-foreground text-sm rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Draft
                </button>
                <button
                  onClick={exportPackage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Disclosure Package
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
