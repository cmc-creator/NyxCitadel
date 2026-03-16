'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileWarning, ArrowLeft, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { computeTriage, triageBadgeStyle } from '@/lib/aiTriage';

export default function NewIrIadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    incidentDate:          '',
    incidentTime:          '',
    incidentType:          'PATIENT_FALL',
    severity:              'MINOR',
    location:              '',
    unitName:              '',
    briefDescription:      '',
    injuryDescription:     '',
    immediateActions:      '',
    // Patient
    patientName:           '',
    patientMRN:            '',
    patientDOB:            '',
    patientAge:            '',
    // Staff
    staffInvolvedNames:    '',
    witnessNames:          '',
    // Notifications
    physicianNotified:     false,
    physicianNotifiedTime: '',
    supervisorNotified:    false,
    supervisorNotifiedTime:'',
    familyNotified:        false,
    familyNotifiedDate:    '',
    // ADHS
    adhsReportable:            false,
    adhsReportableCategory:    '5-day',
    // AHCCCS
    ahcccsReportable:          false,
    // JC
    jcReportable:              false,
    // IAD
    iadRequired:               false,
    iadPeriod:                 '',
    // Investigation
    assignedTo:                '',
    notes:                     '',
  });

  type BoolField =
    | 'physicianNotified' | 'supervisorNotified' | 'familyNotified'
    | 'adhsReportable' | 'ahcccsReportable' | 'jcReportable' | 'iadRequired';

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const toggle = (field: BoolField) => () =>
    setForm(f => ({ ...f, [field]: !f[field] }));

  // ── AI Triage (computed, not stored in form state) ─────────────────────────
  const triage = useMemo(() => computeTriage({
    incidentType:   form.incidentType,
    severity:       form.severity,
    adhsReportable: form.adhsReportable,
    jcReportable:   form.jcReportable,
  }), [form.incidentType, form.severity, form.adhsReportable, form.jcReportable]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/incident-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patientAge: form.patientAge ? Number(form.patientAge) : null,
          patientDOB: form.patientDOB || null,
          familyNotifiedDate: form.familyNotifiedDate || null,
          // AI Triage fields
          aiTriageSeverity:   triage.severity,
          aiTriageTags:       triage.tags.join(','),
          aiCascadeTriggered: triage.cascadeTriggered,
          aiTriageReason:     triage.reason,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Save failed');
      }
      router.push('/trackers/ir-iad');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const CheckRow = ({
    label, field, children,
  }: {
    label: string;
    field: BoolField;
    children?: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form[field]}
          onChange={toggle(field)}
          className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
      {form[field] && children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/trackers/ir-iad" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to IR / IAD Tracker
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileWarning className="w-6 h-6 text-red-500" />
          Log Incident Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ADHS ARS 36-2402 · AHCCCS ACOM · JC Sentinel Event Policy
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Incident Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Incident <span className="text-red-500">*</span></label>
              <input type="date" required value={form.incidentDate} onChange={set('incidentDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time of Incident</label>
              <input type="time" value={form.incidentTime} onChange={set('incidentTime')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type <span className="text-red-500">*</span></label>
              <select required value={form.incidentType} onChange={set('incidentType')} className="input-field w-full">
                <option value="PATIENT_FALL">Patient Fall</option>
                <option value="MEDICATION_ERROR">Medication Error</option>
                <option value="ELOPEMENT">Elopement</option>
                <option value="ASSAULT_PATIENT_TO_STAFF">Assault - Patient to Staff</option>
                <option value="ASSAULT_PATIENT_TO_PATIENT">Assault - Patient to Patient</option>
                <option value="SELF_HARM">Self-Harm</option>
                <option value="SUICIDE_ATTEMPT">Suicide Attempt</option>
                <option value="SUICIDE_COMPLETION">Suicide Completion</option>
                <option value="RESTRAINT_SECLUSION_INJURY">Restraint / Seclusion Injury</option>
                <option value="ABUSE_NEGLECT">Abuse / Neglect</option>
                <option value="SEXUAL_ASSAULT">Sexual Assault</option>
                <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
                <option value="INFECTION_OUTBREAK">Infection Outbreak</option>
                <option value="PRIVACY_BREACH">Privacy Breach</option>
                <option value="WORKPLACE_INJURY">Workplace Injury</option>
                <option value="SENTINEL_EVENT">Sentinel Event</option>
                <option value="NEAR_MISS">Near Miss</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity <span className="text-red-500">*</span></label>
              <select required value={form.severity} onChange={set('severity')} className="input-field w-full">
                <option value="NEAR_MISS">Near Miss (no harm)</option>
                <option value="MINOR">Minor (temporary, minor harm)</option>
                <option value="MODERATE">Moderate (temporary, significant harm)</option>
                <option value="SERIOUS">Serious (permanent harm)</option>
                <option value="SENTINEL">Sentinel (death / catastrophic)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" placeholder="e.g. Unit A - Room 104" value={form.location} onChange={set('location')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
              <input type="text" placeholder="e.g. Acute Adult Psych" value={form.unitName} onChange={set('unitName')}
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description of Incident <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={form.briefDescription} onChange={set('briefDescription')}
              placeholder="Provide a detailed, factual description of what occurred..."
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Injury Description</label>
            <textarea rows={2} value={form.injuryDescription} onChange={set('injuryDescription')}
              placeholder="Describe any injuries sustained..."
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Immediate Actions Taken</label>
            <textarea rows={3} value={form.immediateActions} onChange={set('immediateActions')}
              placeholder="What immediate actions were taken at the time of the incident?"
              className="input-field w-full resize-none" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Patient Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
              <input type="text" value={form.patientName} onChange={set('patientName')}
                placeholder="Full name" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MRN</label>
              <input type="text" value={form.patientMRN} onChange={set('patientMRN')}
                placeholder="Medical record number" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" value={form.patientDOB} onChange={set('patientDOB')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input type="number" min={0} max={130} value={form.patientAge} onChange={set('patientAge')}
                placeholder="Age in years" className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Staff Involved</label>
            <textarea rows={2} value={form.staffInvolvedNames} onChange={set('staffInvolvedNames')}
              placeholder="Names and roles of staff involved..."
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Witnesses</label>
            <input type="text" value={form.witnessNames} onChange={set('witnessNames')}
              placeholder="Witness names" className="input-field w-full" />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Notifications</h2>
          <CheckRow label="Physician Notified" field="physicianNotified">
            <input type="time" value={form.physicianNotifiedTime} onChange={set('physicianNotifiedTime')}
              placeholder="Time notified" className="input-field w-40 text-sm" />
          </CheckRow>
          <CheckRow label="Supervisor Notified" field="supervisorNotified">
            <input type="time" value={form.supervisorNotifiedTime} onChange={set('supervisorNotifiedTime')}
              placeholder="Time notified" className="input-field w-40 text-sm" />
          </CheckRow>
          <CheckRow label="Family / Guardian Notified" field="familyNotified">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date notified</label>
              <input type="date" value={form.familyNotifiedDate} onChange={set('familyNotifiedDate')}
                className="input-field w-44 text-sm" />
            </div>
          </CheckRow>
        </div>

        {/* Regulatory Reporting */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Regulatory Reporting Requirements</h2>

          <CheckRow label="ADHS Reportable (ARS 36-2402)" field="adhsReportable">
            <div className="ml-6">
              <label className="block text-xs text-slate-500 mb-1">Reporting category</label>
              <select value={form.adhsReportableCategory} onChange={set('adhsReportableCategory')}
                className="input-field w-full sm:w-56 text-sm">
                <option value="24-hour">24-Hour Reportable (death, serious injury)</option>
                <option value="5-day">5-Day Reportable</option>
                <option value="annual">Annual IAD Submission Only</option>
              </select>
            </div>
          </CheckRow>

          <CheckRow label="AHCCCS Reportable (SMI / RBHA)" field="ahcccsReportable" />

          <CheckRow label="Joint Commission Reportable (Sentinel Event)" field="jcReportable">
            <p className="ml-6 text-xs text-slate-500">JC requires RCA within 45 days of sentinel event.</p>
          </CheckRow>

          <CheckRow label="IAD Submission Required (state adverse data)" field="iadRequired">
            <div className="ml-6">
              <label className="block text-xs text-slate-500 mb-1">IAD Period</label>
              <input type="text" value={form.iadPeriod} onChange={set('iadPeriod')}
                placeholder="e.g. Q1 2026" className="input-field w-full sm:w-44 text-sm" />
            </div>
          </CheckRow>
        </div>

        {/* Assignment & Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Assignment & Notes</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
            <input type="text" value={form.assignedTo} onChange={set('assignedTo')}
              placeholder="Staff member responsible for investigation" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea rows={3} value={form.notes} onChange={set('notes')}
              placeholder="Additional notes..."
              className="input-field w-full resize-none" />
          </div>
        </div>

        {/* ── NyxSentinel AI Triage Panel ──────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">NyxSentinel - AI Triage Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${triageBadgeStyle(triage.severity)}`}>
              {triage.severity}
            </span>
            {triage.cascadeTriggered && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-red-900 text-red-300 border border-red-700">
                <Zap className="w-3 h-3" /> RCA Workflow Will Auto-Trigger
              </span>
            )}
          </div>
          {triage.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {triage.tags.map(tag => (
                <span key={tag} className="text-xs font-medium text-slate-300 bg-slate-700 px-2 py-0.5 rounded">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 leading-relaxed">{triage.reason}</p>
          {triage.severity === 'CRITICAL' && (
            <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-900/30 border border-amber-700 rounded-lg p-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>This incident meets the threshold for immediate escalation. Ensure all required regulatory notifications are completed and an RCA is initiated within 45 days.</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Log Incident Report'}
          </button>
          <Link href="/trackers/ir-iad" className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
