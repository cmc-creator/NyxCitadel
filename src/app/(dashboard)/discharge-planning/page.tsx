'use client';

import { useState } from 'react';
import { Truck, Plus, AlertTriangle, CheckCircle, Phone } from 'lucide-react';

const mockPlans = [
  { id: '1', patientInitials: 'J.D.', admitDate: '2026-03-06', anticipatedDischarge: '2026-03-20', planInitiatedWithin24h: true, disposition: 'HOME_WITH_SERVICES', aftercareProvider: 'Desert Vistas IOP', followUpApptDate: '2026-03-22', moonNoticeGiven: false, moonNoticeRequired: false, followUpCallDone: null, status: 'IN_PROGRESS' },
  { id: '2', patientInitials: 'M.K.', admitDate: '2026-03-04', anticipatedDischarge: '2026-03-12', planInitiatedWithin24h: true, disposition: 'RESIDENTIAL_TREATMENT', aftercareProvider: 'Sonoran Wellness RTF', followUpApptDate: null, moonNoticeGiven: true, moonNoticeRequired: true, followUpCallDone: null, status: 'IN_PROGRESS' },
  { id: '3', patientInitials: 'A.B.', admitDate: '2026-03-01', anticipatedDischarge: '2026-03-08', planInitiatedWithin24h: true, disposition: 'HOME_SELF_CARE', aftercareProvider: 'Outpatient Psychiatry (in-house)', followUpApptDate: '2026-03-11', moonNoticeGiven: false, moonNoticeRequired: false, followUpCallDone: null, status: 'DISCHARGE_READY' },
  { id: '4', patientInitials: 'T.N.', admitDate: '2026-02-18', anticipatedDischarge: '2026-03-04', planInitiatedWithin24h: true, disposition: 'SNF_PLACEMENT', aftercareProvider: 'Pima Skilled Nursing', followUpApptDate: null, moonNoticeGiven: true, moonNoticeRequired: true, followUpCallDone: true, status: 'DISCHARGED', dischargedOn: '2026-03-04' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  IN_PROGRESS:      { label: 'In Progress',    color: 'bg-blue-100 text-blue-700' },
  DISCHARGE_READY:  { label: 'Ready to DC',    color: 'bg-emerald-100 text-emerald-700' },
  DISCHARGED:       { label: 'Discharged',     color: 'bg-slate-100 text-slate-600' },
  NO_PLAN:          { label: 'Plan Missing',   color: 'bg-red-100 text-red-700' },
};

const dispositionLabels: Record<string, string> = {
  HOME_WITH_SERVICES: 'Home w/ Services',
  HOME_SELF_CARE:     'Home (Self-Care)',
  RESIDENTIAL_TREATMENT: 'Residential Tx',
  SNF_PLACEMENT:      'SNF / Nursing Facility',
  INPATIENT_ACUTE:    'Inpatient Acute',
  AGAINST_MEDICAL_ADVICE: 'AMA',
  COURT_PLACEMENT:    'Court Ordered',
};

export default function DischargePlanningPage() {
  const moonMissing = mockPlans.filter(p => p.moonNoticeRequired && !p.moonNoticeGiven && p.status !== 'DISCHARGED').length;
  const readyToDc = mockPlans.filter(p => p.status === 'DISCHARGE_READY').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Truck className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-bold text-white">Discharge Planning</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">CMS §482.43</span>
          </div>
          <p className="text-slate-400 text-sm">Discharge plan initiation, aftercare coordination, MOON notice tracking, and 72-hour follow-up calls.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Discharge Plan
        </button>
      </div>

      {moonMissing > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">{moonMissing} Medicare patient(s) missing required MOON notice</p>
            <p className="text-xs text-amber-200/70 mt-0.5">MOON (Medicare Outpatient Observation Notice) must be delivered within 36 hours of outpatient/observation status. Non-compliance may result in reduced reimbursement for beneficiaries.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Plans', value: mockPlans.filter(p => p.status === 'IN_PROGRESS').length, color: 'text-blue-400' },
          { label: 'Ready to Discharge', value: readyToDc, color: 'text-emerald-400' },
          { label: 'MOON Missing', value: moonMissing, color: moonMissing > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: '72-Hr Calls Pending', value: mockPlans.filter(p => p.status === 'DISCHARGED' && p.followUpCallDone === null).length, color: 'text-sky-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockPlans.map(p => (
          <div key={p.id} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{p.patientInitials}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[p.status]?.color}`}>
                    {statusConfig[p.status]?.label}
                  </span>
                  {p.moonNoticeRequired && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.moonNoticeGiven ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      MOON {p.moonNoticeGiven ? '✓' : 'PENDING'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Admit: {p.admitDate} · Anticipated DC: {p.anticipatedDischarge}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                  <span>→ {dispositionLabels[p.disposition] ?? p.disposition}</span>
                  {p.aftercareProvider && <span className="text-slate-500">Aftercare: {p.aftercareProvider}</span>}
                  {p.followUpApptDate && <span className="text-emerald-400">Appt: {p.followUpApptDate}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  {p.planInitiatedWithin24h ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="text-slate-500">24h Plan</span>
                </div>
                {p.status === 'DISCHARGED' && (
                  <div className="flex items-center gap-1">
                    <Phone className={`w-3.5 h-3.5 ${p.followUpCallDone ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-slate-500">72h Call</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
