'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileWarning, ArrowLeft, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { computeTriage, triageBadgeStyle } from '@/lib/aiTriage';

export default function EditIrIadPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    incidentDate:           '',
    incidentTime:           '',
    incidentType:           'PATIENT_FALL',
    severity:               'MINOR',
    location:               '',
    unitName:               '',
    briefDescription:       '',
    injuryDescription:      '',
    immediateActions:       '',
    patientName:            '',
    patientMRN:             '',
    patientDOB:             '',
    patientAge:             '',
    staffInvolvedNames:     '',
    witnessNames:           '',
    physicianNotified:      false,
    physicianNotifiedTime:  '',
    supervisorNotified:     false,
    supervisorNotifiedTime: '',
    familyNotified:         false,
    familyNotifiedDate:     '',
    adhsReportable:             false,
    adhsReportableCategory:     '5-day',
    ahcccsReportable:           false,
    jcReportable:               false,
    iadRequired:                false,
    iadPeriod:                  '',
    assignedTo:                 '',
    notes:                      '',
  });

  type BoolField =
    | 'physicianNotified' | 'supervisorNotified' | 'familyNotified'
    | 'adhsReportable' | 'ahcccsReportable' | 'jcReportable' | 'iadRequired';

  useEffect(() => {
    fetch(`/api/incident-reports/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setForm({
          incidentDate:           d.incidentDate ? d.incidentDate.split('T')[0] : '',
          incidentTime:           d.incidentTime ?? '',
          incidentType:           d.incidentType ?? 'PATIENT_FALL',
          severity:               d.severity ?? 'MINOR',
          location:               d.location ?? '',
          unitName:               d.unitName ?? '',
          briefDescription:       d.briefDescription ?? '',
          injuryDescription:      d.injuryDescription ?? '',
          immediateActions:       d.immediateActions ?? '',
          patientName:            d.patientName ?? '',
          patientMRN:             d.patientMRN ?? '',
          patientDOB:             d.patientDOB ? d.patientDOB.split('T')[0] : '',
          patientAge:             d.patientAge != null ? String(d.patientAge) : '',
          staffInvolvedNames:     d.staffInvolvedNames ?? '',
          witnessNames:           d.witnessNames ?? '',
          physicianNotified:      d.physicianNotified ?? false,
          physicianNotifiedTime:  d.physicianNotifiedTime ?? '',
          supervisorNotified:     d.supervisorNotified ?? false,
          supervisorNotifiedTime: d.supervisorNotifiedTime ?? '',
          familyNotified:         d.familyNotified ?? false,
          familyNotifiedDate:     d.familyNotifiedDate ? d.familyNotifiedDate.split('T')[0] : '',
          adhsReportable:             d.adhsReportable ?? false,
          adhsReportableCategory:     d.adhsReportableCategory ?? '5-day',
          ahcccsReportable:           d.ahcccsReportable ?? false,
          jcReportable:               d.jcReportable ?? false,
          iadRequired:                d.iadRequired ?? false,
          iadPeriod:                  d.iadPeriod ?? '',
          assignedTo:                 d.assignedTo ?? '',
          notes:                      d.notes ?? '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const toggle = (field: BoolField) => () =>
    setForm(f => ({ ...f, [field]: !f[field] }));

  const triage = useMemo(() => computeTriage({
    incidentType:   form.incidentType,
    severity:       form.severity,
    adhsReportable: form.adhsReportable,
    jcReportable:   form.jcReportable,
  }), [form.incidentType, form.severity, form.adhsReportable, form.jcReportable]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/incident-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patientAge: form.patientAge ? Number(form.patientAge) : null,
          patientDOB: form.patientDOB || null,
          familyNotifiedDate: form.familyNotifiedDate || null,
          aiTriageSeverity:   triage.severity,
          aiTriageTags:       triage.tags.join(','),
          aiCascadeTriggered: triage.cascadeTriggered,
          aiTriageReason:     triage.reason,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Save failed');
      }
      router.push(`/trackers/ir-iad/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
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
          className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-500"
        />
        <span className="text-sm font-medium text-foreground/80">{label}</span>
      </label>
      {form[field] && children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <a href={`/trackers/ir-iad/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileWarning className="w-6 h-6 text-red-500" />
          Edit Incident Report
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Details */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Incident Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date of Incident <span className="text-red-500">*</span></label>
              <input type="date" required value={form.incidentDate} onChange={set('incidentDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Time of Incident</label>
              <input type="time" value={form.incidentTime} onChange={set('incidentTime')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Incident Type <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-foreground/80 mb-1">Severity <span className="text-red-500">*</span></label>
              <select required value={form.severity} onChange={set('severity')} className="input-field w-full">
                <option value="NEAR_MISS">Near Miss (no harm)</option>
                <option value="MINOR">Minor (temporary, minor harm)</option>
                <option value="MODERATE">Moderate (temporary, significant harm)</option>
                <option value="SERIOUS">Serious (permanent harm)</option>
                <option value="SENTINEL">Sentinel (death / catastrophic)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Location</label>
              <input type="text" value={form.location} onChange={set('location')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Unit Name</label>
              <input type="text" value={form.unitName} onChange={set('unitName')}
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Description of Incident <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={form.briefDescription} onChange={set('briefDescription')}
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Injury Description</label>
            <textarea rows={2} value={form.injuryDescription} onChange={set('injuryDescription')}
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Immediate Actions Taken</label>
            <textarea rows={3} value={form.immediateActions} onChange={set('immediateActions')}
              className="input-field w-full resize-none" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Patient Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Patient Name</label>
              <input type="text" value={form.patientName} onChange={set('patientName')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">MRN</label>
              <input type="text" value={form.patientMRN} onChange={set('patientMRN')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date of Birth</label>
              <input type="date" value={form.patientDOB} onChange={set('patientDOB')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Age</label>
              <input type="number" min={0} max={130} value={form.patientAge} onChange={set('patientAge')}
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Staff Involved</label>
            <textarea rows={2} value={form.staffInvolvedNames} onChange={set('staffInvolvedNames')}
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Witnesses</label>
            <input type="text" value={form.witnessNames} onChange={set('witnessNames')}
              className="input-field w-full" />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Notifications</h2>
          <CheckRow label="Physician Notified" field="physicianNotified">
            <input type="time" value={form.physicianNotifiedTime} onChange={set('physicianNotifiedTime')}
              className="input-field w-40 text-sm" />
          </CheckRow>
          <CheckRow label="Supervisor Notified" field="supervisorNotified">
            <input type="time" value={form.supervisorNotifiedTime} onChange={set('supervisorNotifiedTime')}
              className="input-field w-40 text-sm" />
          </CheckRow>
          <CheckRow label="Family / Guardian Notified" field="familyNotified">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Date notified</label>
              <input type="date" value={form.familyNotifiedDate} onChange={set('familyNotifiedDate')}
                className="input-field w-44 text-sm" />
            </div>
          </CheckRow>
        </div>

        {/* Regulatory Reporting */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Regulatory Reporting Requirements</h2>

          <CheckRow label="ADHS Reportable (ARS 36-2402)" field="adhsReportable">
            <div className="ml-6">
              <label className="block text-xs text-muted-foreground mb-1">Reporting category</label>
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
            <p className="ml-6 text-xs text-muted-foreground">JC requires RCA within 45 days of sentinel event.</p>
          </CheckRow>

          <CheckRow label="IAD Submission Required (state adverse data)" field="iadRequired">
            <div className="ml-6">
              <label className="block text-xs text-muted-foreground mb-1">IAD Period</label>
              <input type="text" value={form.iadPeriod} onChange={set('iadPeriod')}
                className="input-field w-full sm:w-44 text-sm" />
            </div>
          </CheckRow>
        </div>

        {/* Assignment & Notes */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Assignment &amp; Notes</h2>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Assigned To</label>
            <input type="text" value={form.assignedTo} onChange={set('assignedTo')}
              className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
            <textarea rows={3} value={form.notes} onChange={set('notes')}
              className="input-field w-full resize-none" />
          </div>
        </div>

        {/* NyxSentinel AI Triage Panel */}
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
          <p className="text-xs text-muted-foreground/70 leading-relaxed">{triage.reason}</p>
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
            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <a href={`/trackers/ir-iad/${id}`} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg border border-border hover:border-slate-400 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
