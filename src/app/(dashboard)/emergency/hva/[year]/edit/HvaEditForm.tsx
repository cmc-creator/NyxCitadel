'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Plus, Trash2, Save, Copy, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type HazardType = 'NATURAL' | 'TECHNOLOGICAL' | 'HUMAN' | 'HAZMAT' | 'INFRASTRUCTURE';
type HvaStatus = 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'APPROVED';

interface HazardRow {
  id?: string;
  hazardName: string;
  hazardType: HazardType;
  probability: number;
  magnitude: number;
  preparedness: number;
  mitigationPlan: string;
  responsibleParty: string;
  notes: string;
}

interface AssessmentData {
  id: string;
  assessmentYear: number;
  status: HvaStatus;
  reviewedBy: string | null;
  approvedBy: string | null;
  completedDate: string | null;
  documentUrl: string | null;
  notes: string | null;
  hazards: HazardRow[];
}

interface Props {
  year: number;
  assessment: AssessmentData | null;
  previousYear: AssessmentData | null;
}

function calcRiskScore(p: number, m: number, prep: number): number {
  return (p * m * prep) / 27;
}

function riskBadge(score: number) {
  if (score >= 0.7) return { label: 'HIGH', bar: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
  if (score >= 0.4) return { label: 'MED',  bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800' };
  return           { label: 'LOW',  bar: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
}

const HAZARD_TYPES: HazardType[] = ['NATURAL','TECHNOLOGICAL','HUMAN','HAZMAT','INFRASTRUCTURE'];

const TYPE_COLOR: Record<HazardType, string> = {
  NATURAL:        'bg-sky-100 text-sky-800',
  TECHNOLOGICAL:  'bg-teal-100 text-teal-800',
  HUMAN:          'bg-red-100 text-red-800',
  HAZMAT:         'bg-orange-100 text-orange-800',
  INFRASTRUCTURE: 'bg-muted/30 text-foreground/80',
};

const PRESETS: Record<HazardType, string[]> = {
  NATURAL:        ['Earthquake','Tornado / High Wind','Flash Flood','Severe Winter Storm','Wildfire / Smoke','Extreme Heat','Lightning Strike'],
  TECHNOLOGICAL:  ['Power Outage','IT System Failure / Cyber Attack','Medical Gas Failure','HVAC Failure','Backup Generator Failure','Fire Alarm / Suppression Failure'],
  HUMAN:          ['Mass Casualty Incident (MCI)','Active Shooter / Armed Intruder','Bomb Threat','Civil Unrest','Infant / Child Abduction','Workplace Violence'],
  HAZMAT:         ['Hazardous Material Spill','Radiation Exposure','Biological Agent Release','Pandemic / Infectious Disease Outbreak','Drug Diversion'],
  INFRASTRUCTURE: ['Water Main Break','Sewer System Failure','Structural Damage','Elevator Failure','Food Safety / Kitchen Failure'],
};

const PROB_LABELS  = ['0 – N/A', '1 – Low', '2 – Moderate', '3 – High'];
const MAG_LABELS   = ['0 – N/A', '1 – Limited', '2 – Moderate', '3 – Catastrophic'];
const PREP_LABELS  = ['0 – N/A', '1 – Well Prepared', '2 – Partially Prepared', '3 – Not Prepared'];

function emptyRow(type: HazardType = 'NATURAL'): HazardRow {
  return { hazardName: '', hazardType: type, probability: 1, magnitude: 1, preparedness: 1, mitigationPlan: '', responsibleParty: '', notes: '' };
}

export default function HvaEditForm({ year, assessment, previousYear }: Props) {
  const router = useRouter();

  const [status,        setStatus]        = useState<HvaStatus>(assessment?.status ?? 'IN_PROGRESS');
  const [reviewedBy,    setReviewedBy]    = useState(assessment?.reviewedBy    ?? '');
  const [approvedBy,    setApprovedBy]    = useState(assessment?.approvedBy    ?? '');
  const [completedDate, setCompletedDate] = useState(assessment?.completedDate ? assessment.completedDate.slice(0,10) : '');
  const [documentUrl,   setDocumentUrl]   = useState(assessment?.documentUrl   ?? '');
  const [metaNotes,     setMetaNotes]     = useState(assessment?.notes         ?? '');

  const [hazards, setHazards] = useState<HazardRow[]>(
    assessment?.hazards?.map(h => ({
      id:               h.id,
      hazardName:       h.hazardName,
      hazardType:       h.hazardType as HazardType,
      probability:      h.probability,
      magnitude:        h.magnitude,
      preparedness:     h.preparedness,
      mitigationPlan:   h.mitigationPlan   ?? '',
      responsibleParty: h.responsibleParty ?? '',
      notes:            h.notes            ?? '',
    })) ?? []
  );

  const [expanded,    setExpanded]    = useState<Set<number>>(new Set());
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateField = useCallback((idx: number, key: keyof HazardRow, val: string | number) => {
    setHazards(rows => rows.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  }, []);

  const removeRow = useCallback((idx: number) => {
    setHazards(rows => rows.filter((_, i) => i !== idx));
    setExpanded(prev => {
      const next = new Set<number>();
      prev.forEach(i => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1); });
      return next;
    });
  }, []);

  const addRow = (type: HazardType) => setHazards(rows => [...rows, emptyRow(type)]);

  const copyFromPrev = () => {
    if (!previousYear?.hazards?.length) return;
    setHazards(previousYear.hazards.map(h => ({
      hazardName:       h.hazardName,
      hazardType:       h.hazardType as HazardType,
      probability:      h.probability,
      magnitude:        h.magnitude,
      preparedness:     h.preparedness,
      mitigationPlan:   h.mitigationPlan   ?? '',
      responsibleParty: h.responsibleParty ?? '',
      notes:            h.notes            ?? '',
    })));
  };

  const toggleExpand = (idx: number) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    return next;
  });

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      const res = await fetch('/api/hva-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentYear: year,
          status,
          reviewedBy:    reviewedBy    || null,
          approvedBy:    approvedBy    || null,
          completedDate: completedDate || null,
          documentUrl:   documentUrl   || null,
          notes:         metaNotes     || null,
          hazards: hazards.map(h => ({
            hazardName:       h.hazardName,
            hazardType:       h.hazardType,
            probability:      h.probability,
            magnitude:        h.magnitude,
            preparedness:     h.preparedness,
            mitigationPlan:   h.mitigationPlan   || null,
            responsibleParty: h.responsibleParty || null,
            notes:            h.notes            || null,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        setSaveError(err.error ?? 'Save failed');
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        router.refresh();
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const highCount = hazards.filter(h => calcRiskScore(h.probability, h.magnitude, h.preparedness) >= 0.7).length;
  const medCount  = hazards.filter(h => { const s = calcRiskScore(h.probability, h.magnitude, h.preparedness); return s >= 0.4 && s < 0.7; }).length;

  return (
    <div className="space-y-5 pb-16">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/emergency/hva" className="text-xs text-muted-foreground hover:text-amber-600 transition-colors">← HVA Overview</Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            {year}&nbsp;Hazard Vulnerability Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">JC EM.01.01.01 &middot; Kaiser Permanente HVA Methodology</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* ── Alerts ── */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-800 font-medium">
          ✓ {year} HVA saved successfully.
        </div>
      )}
      {saveError && (
        <div className="bg-red-950/20 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-800">
          Error: {saveError}
        </div>
      )}

      {/* ── Assessment Details ── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Assessment Details</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as HvaStatus)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Completion Date</label>
            <input type="date" value={completedDate} onChange={e => setCompletedDate(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Reviewed By</label>
            <input type="text" value={reviewedBy} onChange={e => setReviewedBy(e.target.value)} placeholder="Name / Title"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Approved By</label>
            <input type="text" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Name / Title"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Document URL&nbsp;<span className="font-normal text-muted-foreground/70">(existing HVA PDF / spreadsheet link)</span></label>
            <div className="flex gap-2">
              <input type="url" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="https://..."
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              {documentUrl && (
                <a href={documentUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs border border-border rounded-lg px-3 py-2 hover:bg-muted/20 text-muted-foreground transition-colors whitespace-nowrap">
                  <ExternalLink className="w-3.5 h-3.5" />Open
                </a>
              )}
            </div>
          </div>
          <div className="col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Notes</label>
            <textarea value={metaNotes} onChange={e => setMetaNotes(e.target.value)} rows={2}
              placeholder="Overall assessment notes, scope, or context..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" />
          </div>
        </div>
      </div>

      {/* ── Scoring Guide ── */}
      <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-200 rounded-lg p-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Scoring formula:</span> (Probability × Magnitude × Preparedness) / 27&emsp;
          <span className="font-semibold">Probability:</span> 0=N/A &middot; 1=Low &middot; 2=Moderate &middot; 3=High&emsp;
          <span className="font-semibold">Magnitude:</span> 0=N/A &middot; 1=Limited &middot; 2=Moderate &middot; 3=Catastrophic&emsp;
          <span className="font-semibold">Preparedness (gap):</span> 0=N/A &middot; 1=Well Prepared &middot; 2=Partial &middot; 3=Not Prepared&emsp;
          <span className="font-semibold text-red-700">HIGH ≥70%</span> &middot; <span className="font-semibold text-yellow-700">MED ≥40%</span> &middot; <span className="font-semibold text-green-700">LOW &lt;40%</span>
        </div>
      </div>

      {/* ── Hazards Table ── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">

        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            Hazards&nbsp;({hazards.length})
          </span>
          {highCount > 0 && <span className="text-xs bg-red-100 text-red-800 font-medium px-2 py-0.5 rounded-full">{highCount} HIGH</span>}
          {medCount  > 0 && <span className="text-xs bg-yellow-100 text-yellow-800 font-medium px-2 py-0.5 rounded-full">{medCount} MED</span>}
          <div className="flex-1" />
          {previousYear && previousYear.hazards && previousYear.hazards.length > 0 && (
            <button onClick={copyFromPrev}
              className="inline-flex items-center gap-1 text-xs border border-amber-300 text-amber-700 bg-amber-950/20 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
              <Copy className="w-3 h-3" />Copy from {year - 1} ({previousYear.hazards.length} hazards)
            </button>
          )}
          <span className="text-xs text-muted-foreground/70 hidden sm:block">Add:</span>
          {HAZARD_TYPES.map(t => (
            <button key={t} onClick={() => addRow(t)}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-transparent font-medium transition-colors hover:opacity-80 ${TYPE_COLOR[t]}`}>
              <Plus className="w-3 h-3" />{t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_130px_64px] gap-2 px-4 py-2 border-b border-border/30 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground">Hazard Name</span>
          <span className="text-xs font-semibold text-muted-foreground">Type</span>
          <span className="text-xs font-semibold text-muted-foreground text-center">Probability</span>
          <span className="text-xs font-semibold text-muted-foreground text-center">Magnitude</span>
          <span className="text-xs font-semibold text-muted-foreground text-center">Preparedness</span>
          <span className="text-xs font-semibold text-muted-foreground">Risk Score</span>
          <span />
        </div>

        {hazards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/70">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="text-sm font-medium">No hazards added yet.</p>
            <p className="text-xs mt-1">Use the buttons above, or copy from a prior year.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {hazards.map((hazard, idx) => {
              const score = calcRiskScore(hazard.probability, hazard.magnitude, hazard.preparedness);
              const rb    = riskBadge(score);
              const open  = expanded.has(idx);
              return (
                <div key={idx} className="group">
                  {/* Main row */}
                  <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_130px_64px] gap-2 items-center px-4 py-2 hover:bg-muted/20 transition-colors">

                    {/* Name + datalist presets */}
                    <div>
                      <input type="text" value={hazard.hazardName} list={`presets-${idx}`}
                        onChange={e => updateField(idx, 'hazardName', e.target.value)}
                        placeholder="Hazard name…"
                        className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      <datalist id={`presets-${idx}`}>
                        {PRESETS[hazard.hazardType].map(p => <option key={p} value={p} />)}
                      </datalist>
                    </div>

                    {/* Type */}
                    <select value={hazard.hazardType} onChange={e => updateField(idx, 'hazardType', e.target.value as HazardType)}
                      className={`border border-transparent rounded px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${TYPE_COLOR[hazard.hazardType]}`}>
                      {HAZARD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
                    </select>

                    {/* Probability */}
                    <select value={hazard.probability} onChange={e => updateField(idx, 'probability', Number(e.target.value))}
                      className="border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-center">
                      {PROB_LABELS.map((l, v) => <option key={v} value={v}>{l}</option>)}
                    </select>

                    {/* Magnitude */}
                    <select value={hazard.magnitude} onChange={e => updateField(idx, 'magnitude', Number(e.target.value))}
                      className="border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500">
                      {MAG_LABELS.map((l, v) => <option key={v} value={v}>{l}</option>)}
                    </select>

                    {/* Preparedness */}
                    <select value={hazard.preparedness} onChange={e => updateField(idx, 'preparedness', Number(e.target.value))}
                      className="border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500">
                      {PREP_LABELS.map((l, v) => <option key={v} value={v}>{l}</option>)}
                    </select>

                    {/* Risk score bar + badge */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-muted/30 rounded-full h-1.5 min-w-0">
                        <div className={`h-1.5 rounded-full transition-all ${rb.bar}`} style={{ width: `${Math.round(score * 100)}%` }} />
                      </div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${rb.badge}`}>
                        {rb.label}&nbsp;{Math.round(score * 100)}%
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleExpand(idx)} title="Details"
                        className="p-1 text-muted-foreground/70 hover:text-amber-600 transition-colors">
                        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => removeRow(idx)} title="Remove"
                        className="p-1 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail row */}
                  {open && (
                    <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-border/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Mitigation Plan</label>
                        <textarea value={hazard.mitigationPlan} rows={3}
                          onChange={e => updateField(idx, 'mitigationPlan', e.target.value)}
                          placeholder="What is the response / mitigation plan for this hazard?"
                          className="w-full border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Responsible Party</label>
                        <input type="text" value={hazard.responsibleParty}
                          onChange={e => updateField(idx, 'responsibleParty', e.target.value)}
                          placeholder="Department / Name"
                          className="w-full border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                        <textarea value={hazard.notes} rows={3}
                          onChange={e => updateField(idx, 'notes', e.target.value)}
                          placeholder="Additional context or notes"
                          className="w-full border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom save bar ── */}
      <div className="flex items-center justify-between bg-card rounded-xl border border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {hazards.length} hazard{hazards.length !== 1 ? 's' : ''}&emsp;
          {highCount > 0 && <span className="text-red-600 font-medium">{highCount} HIGH&ensp;</span>}
          {medCount  > 0 && <span className="text-yellow-600 font-medium">{medCount} MED</span>}
        </p>
        <div className="flex items-center gap-3">
          <Link href="/emergency/hva" className="text-sm text-muted-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted/20 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}