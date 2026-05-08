'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Save, Loader2, BarChart3 } from 'lucide-react';

/**
 * HBIPS Core Measures (Joint Commission / ORYX)
 * For Behavioral Health / Psychiatric hospitals
 *
 * HBIPS-1:  Physical Restraint Use
 * HBIPS-2:  Seclusion Use
 * HBIPS-3:  Patients Discharged on Multiple Antipsychotic Medications
 * HBIPS-4:  Patients Discharged on Multiple Antipsychotic Medications with Appropriate Justification
 * HBIPS-5:  Continuing Care Plan Created
 * HBIPS-6:  Continuing Care Plan Transmitted to Next Level of Care Provider
 * HBIPS-7:  Post-Discharge Continuing Care Plan Transmitted to Individual Patient
 */

const HBIPS_MEASURES = [
  {
    id: 'HBIPS1',
    label: 'HBIPS-1: Physical Restraint Hours',
    description: 'Total hours of physical restraint use per 1,000 patient-hours.',
    fields: [
      { key: 'totalRestraintHours', label: 'Total Physical Restraint Hours', type: 'number' },
      { key: 'totalPatientHours',   label: 'Total Patient-Hours',            type: 'number' },
    ],
  },
  {
    id: 'HBIPS2',
    label: 'HBIPS-2: Seclusion Hours',
    description: 'Total hours of seclusion use per 1,000 patient-hours.',
    fields: [
      { key: 'totalSeclusionHours', label: 'Total Seclusion Hours', type: 'number' },
      { key: 'totalPatientHours2',  label: 'Total Patient-Hours',   type: 'number' },
    ],
  },
  {
    id: 'HBIPS3',
    label: 'HBIPS-3: Multiple Antipsychotics at Discharge',
    description: 'Patients discharged on 2+ antipsychotic medications.',
    fields: [
      { key: 'h3Numerator',   label: 'Patients on 2+ Antipsychotics (Numerator)',   type: 'number' },
      { key: 'h3Denominator', label: 'Total Patients Discharged (Denominator)',       type: 'number' },
    ],
  },
  {
    id: 'HBIPS4',
    label: 'HBIPS-4: Multiple Antipsychotics with Justification',
    description: 'Patients on 2+ antipsychotics with documented appropriate justification.',
    fields: [
      { key: 'h4Numerator',   label: 'Justified (Numerator)',   type: 'number' },
      { key: 'h4Denominator', label: 'On 2+ Antipsychotics (Denominator)', type: 'number' },
    ],
  },
  {
    id: 'HBIPS5',
    label: 'HBIPS-5: Continuing Care Plan Created',
    description: 'Patients with a documented continuing care plan at discharge.',
    fields: [
      { key: 'h5Numerator',   label: 'With Care Plan (Numerator)',       type: 'number' },
      { key: 'h5Denominator', label: 'Total Discharged (Denominator)',   type: 'number' },
    ],
  },
  {
    id: 'HBIPS6',
    label: 'HBIPS-6: Care Plan Transmitted to Next Provider',
    description: 'Patients whose care plan was transmitted to the next level of care provider.',
    fields: [
      { key: 'h6Numerator',   label: 'Transmitted (Numerator)',          type: 'number' },
      { key: 'h6Denominator', label: 'Total Discharged (Denominator)',   type: 'number' },
    ],
  },
  {
    id: 'HBIPS7',
    label: 'HBIPS-7: Care Plan Transmitted to Patient',
    description: 'Patients who received their care plan at discharge.',
    fields: [
      { key: 'h7Numerator',   label: 'Patient Received Plan (Numerator)', type: 'number' },
      { key: 'h7Denominator', label: 'Total Discharged (Denominator)',     type: 'number' },
    ],
  },
];

function buildXML(period: string, facilityName: string, data: Record<string, string>): string {
  const now = new Date().toISOString();
  const measures = HBIPS_MEASURES.map(m => {
    const fields = m.fields.map(f =>
      `      <field id="${f.key}">${data[f.key] ?? '0'}</field>`
    ).join('\n');
    return `  <measure id="${m.id}">\n${fields}\n  </measure>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- HBIPS/ORYX Submission Data Export -->
<!-- Generated: ${now} -->
<!-- Reporting Period: ${period} -->
<submission xmlns="urn:jc:oryx:hbips:v1">
  <facility name="${facilityName}" />
  <reportingPeriod>${period}</reportingPeriod>
  <exportedAt>${now}</exportedAt>
  <measures>
${measures}
  </measures>
</submission>`;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OryxPage() {
  const [period, setPeriod]           = useState('');
  const [facilityName, setFacility]   = useState('');
  const [data, setData]               = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);
  const [savedMsg, setSavedMsg]       = useState('');

  function setField(key: string, val: string) {
    setData(prev => ({ ...prev, [key]: val }));
  }

  function exportXML() {
    if (!period) { alert('Enter a reporting period first.'); return; }
    const xml = buildXML(period, facilityName, data);
    downloadFile(xml, `HBIPS_ORYX_${period.replace('/', '-')}.xml`, 'application/xml');
  }

  async function saveDraft() {
    setSaving(true);
    try {
      await fetch('/api/regulatory-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'ORYX_HBIPS',
          reportingPeriod: period,
          status: 'DRAFT',
          data,
        }),
      });
      setSavedMsg('Draft saved');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/reporting" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reporting
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          HBIPS / ORYX Measures
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter monthly HBIPS core measure data and export an XML file for upload to the Joint Commission ORYX portal.
        </p>
      </div>

      {/* Period & facility */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Submission Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reporting Period <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              placeholder="e.g. 2026-03 or 2026-Q1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Facility Name</label>
            <input
              type="text"
              value={facilityName}
              onChange={e => setFacility(e.target.value)}
              placeholder="Your hospital name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* HBIPS measure entry */}
      {HBIPS_MEASURES.map(m => (
        <div key={m.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <div className="font-semibold text-sm text-foreground">{m.label}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {m.fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
                <input
                  type="number"
                  min="0"
                  value={data[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
          {/* Calculated rate display */}
          {m.fields.length === 2 && data[m.fields[0].key] && data[m.fields[1].key] && (
            <div className="text-xs text-teal-400">
              {m.id === 'HBIPS1' || m.id === 'HBIPS2'
                ? `Rate: ${((parseInt(data[m.fields[0].key] ?? '0') / Math.max(parseInt(data[m.fields[1].key] ?? '1'), 1)) * 1000).toFixed(2)} per 1,000 patient-hours`
                : `Rate: ${((parseInt(data[m.fields[0].key] ?? '0') / Math.max(parseInt(data[m.fields[1].key] ?? '1'), 1)) * 100).toFixed(1)}%`
              }
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          ⓘ Export XML for manual upload to the{' '}
          <a href="https://www.jointcommission.org/measurement/oryx/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
            JC ORYX portal
          </a>.
        </div>
        <div className="flex gap-3 items-center">
          {savedMsg && <span className="text-xs text-green-400">{savedMsg}</span>}
          <button
            onClick={saveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-slate-300 hover:text-foreground text-sm rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={exportXML}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export XML
          </button>
        </div>
      </div>
    </div>
  );
}
