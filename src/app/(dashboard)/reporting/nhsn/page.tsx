'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Save, Loader2, ShieldAlert } from 'lucide-react';

const HAI_TYPES = [
  { key: 'CLABSI', label: 'CLABSI', description: 'Central Line-Associated Bloodstream Infection' },
  { key: 'CAUTI',  label: 'CAUTI',  description: 'Catheter-Associated Urinary Tract Infection' },
  { key: 'SSI',    label: 'SSI',    description: 'Surgical Site Infection' },
  { key: 'MRSA',   label: 'MRSA Bacteremia', description: 'MRSA Bacteremia Lab-identified Event' },
  { key: 'CDI',    label: 'CDI',    description: 'Clostridioides difficile Lab-identified Event' },
  { key: 'VAP',    label: 'VAP',    description: 'Ventilator-Associated Pneumonia' },
];

type HAIData = {
  numerator: string;
  patientDays: string;
  deviceDays: string;
  sir: string;
};

function buildCSV(period: string, facilityName: string, data: Record<string, HAIData>): string {
  const rows = [
    ['NHSN HAI Surveillance Export'],
    [`Facility: ${facilityName}`],
    [`Reporting Period: ${period}`],
    [`Generated: ${new Date().toISOString()}`],
    [],
    ['HAI Type', 'Events (Numerator)', 'Patient-Days', 'Device-Days', 'SIR / Rate'],
    ...HAI_TYPES.map(h => {
      const d = data[h.key] ?? {};
      return [h.label, d.numerator ?? '0', d.patientDays ?? '0', d.deviceDays ?? '0', d.sir ?? ''];
    }),
  ];
  return rows.map(r => r.join(',')).join('\n');
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

export default function NhsnPage() {
  const [period, setPeriod]         = useState('');
  const [facilityName, setFacility] = useState('');
  const [data, setData]             = useState<Record<string, HAIData>>({});
  const [saving, setSaving]         = useState(false);
  const [savedMsg, setSavedMsg]     = useState('');

  function setField(haiType: string, field: keyof HAIData, val: string) {
    setData(prev => ({
      ...prev,
      [haiType]: { ...prev[haiType], [field]: val } as HAIData,
    }));
  }

  function exportCSV() {
    if (!period) { alert('Enter a reporting period first.'); return; }
    const csv = buildCSV(period, facilityName, data);
    downloadFile(csv, `NHSN_HAI_${period.replace('/', '-')}.csv`, 'text/csv');
  }

  async function saveDraft() {
    setSaving(true);
    try {
      await fetch('/api/regulatory-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionType: 'NHSN_HAI', reportingPeriod: period, status: 'DRAFT', data }),
      });
      setSavedMsg('Draft saved');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch { /* silent */ } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/reporting" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reporting
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-blue-400" />
          NHSN Healthcare-Associated Infections
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Enter monthly HAI surveillance data and export a CSV file for upload to the CDC NHSN portal.
        </p>
      </div>

      {/* Period */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Submission Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reporting Period <span className="text-red-400">*</span></label>
            <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. 2026-03"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Facility Name</label>
            <input type="text" value={facilityName} onChange={e => setFacility(e.target.value)} placeholder="Your hospital name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      </div>

      {/* HAI data entry */}
      {HAI_TYPES.map(h => (
        <div key={h.key} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <div className="font-semibold text-sm text-foreground">{h.label}</div>
            <p className="text-xs text-slate-500">{h.description}</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {([
              { field: 'numerator',   label: 'Events' },
              { field: 'patientDays', label: 'Patient-Days' },
              { field: 'deviceDays',  label: 'Device-Days' },
              { field: 'sir',         label: 'SIR / Rate' },
            ] as { field: keyof HAIData; label: string }[]).map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                <input
                  type="number" min="0" step="0.01"
                  value={data[h.key]?.[field] ?? ''}
                  onChange={e => setField(h.key, field, e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          ⓘ Export CSV for manual upload to the{' '}
          <a href="https://www.cdc.gov/nhsn/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">CDC NHSN portal</a>.
        </div>
        <div className="flex gap-3 items-center">
          {savedMsg && <span className="text-xs text-green-400">{savedMsg}</span>}
          <button onClick={saveDraft} disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-slate-300 hover:text-foreground text-sm rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
          </button>
          <button onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
