'use client';

import { useState } from 'react';
import { ShieldAlert, Printer, CheckCircle2, FileText, Calendar, AlertTriangle, X, Sparkles, Building2, Award, Clock } from 'lucide-react';

export function UnannouncedSurveyDossierModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/40 border border-red-400/40 animate-pulse hover:animate-none"
      >
        <ShieldAlert className="w-4 h-4 text-white" />
        <span>🚨 Surveyor in Lobby (1-Click Dossier)</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-red-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-5 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    Surveyor Arrival Readiness Dossier
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      STATUS: READY (96.4%)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300">
                    Destiny Springs Healthcare · License #BHS-004921 · Acute Psychiatric (90 Beds)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Packet
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-foreground print:p-0">
              {/* Executive Summary Callout */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-emerald-300">Immediate Surveyor Briefing Summary</p>
                  <p className="text-slate-300 leading-relaxed">
                    All core psychiatric standards (TJC NPSG.15.01.01, CMS §482.13, AZ ADHS R9-10) are in active compliance.
                    Zero active Immediate Jeopardy (IJ) conditions. All 90 clinical staff CPR/CPI credentials are current.
                  </p>
                </div>
              </div>

              {/* Grid 1: Key Facility Evidence Packet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-teal-500" /> Facility Licenses & Accreditation
                  </h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>AZ ADHS Behavioral License:</span>
                      <span className="font-mono font-bold text-foreground">#BHS-004921 (Active)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>Joint Commission Accreditation:</span>
                      <span className="font-mono font-bold text-foreground">#582910 (Current)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>CMS Provider Number (CCN):</span>
                      <span className="font-mono font-bold text-foreground">#03-4019</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Licensed Bed Capacity:</span>
                      <span className="font-bold text-foreground">90 Inpatient Psych Beds</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Award className="w-4 h-4 text-teal-500" /> Life Safety & Environmental Health
                  </h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>Q1 NFPA 101 Fire Drill:</span>
                      <span className="font-bold text-emerald-400">Completed Jan 18, 2026</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>Ligature Audit (Unit 1 & 2):</span>
                      <span className="font-bold text-emerald-400">Passed (Zero Risk)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span>Emergency Generator Test:</span>
                      <span className="font-bold text-emerald-400">Passed Feb 02, 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water Quality & Infection Audit:</span>
                      <span className="font-bold text-emerald-400">Compliant (100%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Key Contacts & Leadership */}
              <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> On-Duty Hospital Escorts & Leadership Contacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <p className="font-bold text-foreground">Sarah Jenkins, RN</p>
                    <p className="text-[11px] text-teal-400">Chief Nursing Officer (CNO)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ext. 4012 · On Site</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <p className="font-bold text-foreground">Marcus Vance, M.D.</p>
                    <p className="text-[11px] text-teal-400">Chief Medical Officer (CMO)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ext. 4002 · On Site</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <p className="font-bold text-foreground">Elena Rostova</p>
                    <p className="text-[11px] text-teal-400">VP Quality & Compliance</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ext. 4088 · On Site</p>
                  </div>
                </div>
              </div>

              {/* Ready Evidence Folders */}
              <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                  <FileText className="w-4 h-4" /> 14 Standard Evidence Folders Auto-Compiled
                </span>
                <span>Generated automatically by NyxCitadel Compliance Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
