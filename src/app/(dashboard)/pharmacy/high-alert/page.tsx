'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';

const mockAudits = [
  { id: '1', auditDate: '2026-03-06', unit: 'Acute Adult A', medication: 'Concentrated Oral Potassium', ismpCategory: 'Electrolytes', storageCorrect: true, labelingCorrect: true, doubleCheckDocumented: true, accessRestricted: true, actionRequired: false, findings: null },
  { id: '2', auditDate: '2026-03-06', unit: 'Acute Adult A', medication: 'Insulin (all types)', ismpCategory: 'Insulin', storageCorrect: true, labelingCorrect: false, doubleCheckDocumented: true, accessRestricted: true, actionRequired: true, findings: 'Insulin aspart and glargine stored adjacent without color differentiation — add auxiliary label.' },
  { id: '3', auditDate: '2026-03-05', unit: 'Geriatric Psych', medication: 'Warfarin', ismpCategory: 'Anticoagulants', storageCorrect: true, labelingCorrect: true, doubleCheckDocumented: false, accessRestricted: true, actionRequired: true, findings: 'No documented double-check for today\'s dosing — complete independent double-check per policy.' },
  { id: '4', auditDate: '2026-03-04', unit: 'Child/Adolescent', medication: 'Heparin IV', ismpCategory: 'Anticoagulants', storageCorrect: true, labelingCorrect: true, doubleCheckDocumented: true, accessRestricted: true, actionRequired: false, findings: null },
];

export default function HighAlertMedsPage() {
  const actions = mockAudits.filter(a => a.actionRequired).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">High-Alert Medication Audits</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">ISMP / TJC MM.01</span>
          </div>
          <p className="text-slate-400 text-sm">Storage, labeling, access restriction, and double-check compliance audits for ISMP high-alert medications.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Audit
        </button>
      </div>

      {actions > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{actions} audit(s) contain action-required findings. Address before end of shift.</p>
        </div>
      )}

      <div className="space-y-4">
        {mockAudits.map(a => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.actionRequired ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-slate-800/50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">{a.medication}</p>
                  <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded">{a.ismpCategory}</span>
                  {a.actionRequired && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Action Required</span>}
                </div>
                <p className="text-xs text-slate-400">{a.unit} — {a.auditDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-xs mt-2">
              {[
                { label: 'Storage', ok: a.storageCorrect },
                { label: 'Labeling', ok: a.labelingCorrect },
                { label: 'Double-Check', ok: a.doubleCheckDocumented },
                { label: 'Access Restricted', ok: a.accessRestricted },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span className={item.ok ? 'text-slate-300' : 'text-amber-300'}>{item.label}</span>
                </div>
              ))}
            </div>
            {a.findings && <p className="text-xs text-amber-200/80 mt-2 border-t border-amber-500/20 pt-2">⚠️ {a.findings}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
