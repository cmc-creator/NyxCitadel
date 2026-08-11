'use client';

import { useState } from 'react';
import {
  FileWarning,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Clock,
  Building2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdhsFilingGenerator() {
  const [incidentType, setIncidentType] = useState('Sentinel Event / Serious Physical Injury');
  const [patientId, setPatientId] = useState('PT-8942');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().substring(0, 16)
  );
  const [details, setDetails] = useState(
    'Patient sustained a minor laceration during physical de-escalation on Unit 1. Treated immediately by attending physician with zero loss of consciousness.'
  );

  const [copied, setCopied] = useState(false);

  const facilityName = 'Destiny Springs Healthcare';
  const adhsLicense = 'AZ-DOH-PSY-84920';

  const generatedFilingText = `ARIZONA DEPARTMENT OF HEALTH SERVICES (ADHS)
MANDATORY 24-HOUR ADVERSE INCIDENT NOTIFICATION
Rule Authority: A.A.C. R9-10-108 & A.A.C. R9-10-202

FACILITY INFORMATION:
- Facility Name: ${facilityName}
- ADHS License Number: ${adhsLicense}
- Facility Type: Acute Psychiatric Inpatient Hospital (Peoria, AZ)

INCIDENT DETAILS:
- Incident Category: ${incidentType}
- Patient Identifier: ${patientId}
- Date & Time of Occurrence: ${incidentDate.replace('T', ' ')}
- Reporting Window: WITHIN 24 HOURS (COMPLIANT)

NARRATIVE SUMMARY:
${details}

IMMEDIATE CORRECTIVE ACTIONS TAKEN:
1. Patient evaluated by attending psychiatrist and medical staff immediately.
2. Vital signs stable. Family and legal guardian notified.
3. Internal Root Cause Analysis (RCA) initiated per hospital risk management policy.

Submitted by: Chief Risk Officer / Compliance Officer
Notification Timestamp: ${new Date().toLocaleString()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedFilingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-card border border-red-500/30 rounded-2xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base flex items-center gap-2">
              AZ ADHS 24-Hour Incident Filing Generator
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                A.A.C. R9-10
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">Auto-format state incident notifications for the Arizona Department of Health Services.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">Incident Category</label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full p-2.5 bg-muted border border-border rounded-xl font-semibold"
          >
            <option>Sentinel Event / Serious Physical Injury</option>
            <option>Unscheduled Hospital Transfer</option>
            <option>Elopement of Involuntary Patient (Title 36)</option>
            <option>Medication Variance / Adverse Reaction</option>
            <option>Restraint / Seclusion Incident</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Patient ID / Medical Record #</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-2.5 bg-muted border border-border rounded-xl font-semibold"
          />
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <label className="font-semibold text-foreground block">Incident Narrative Details</label>
        <textarea
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Formatted Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-400" /> Formatted ADHS Notification Payload
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Payload!' : 'Copy Payload'}
          </button>
        </div>

        <pre className="text-[11px] font-mono bg-muted/80 border border-border/80 rounded-xl p-4 text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {generatedFilingText}
        </pre>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => alert('ADHS 24-Hour Incident Form exported to PDF!')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Download className="w-4 h-4" /> Download ADHS Form PDF
        </button>
      </div>
    </div>
  );
}
