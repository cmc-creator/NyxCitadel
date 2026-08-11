'use client';

import { useState } from 'react';
import {
  FileText,
  Printer,
  X,
  ShieldCheck,
  Building2,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveBoardDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityName?: string;
  complianceScore?: number;
  openCaps?: number;
  incidentCount?: number;
}

export function ExecutiveBoardDeckModal({
  isOpen,
  onClose,
  facilityName = 'Destiny Springs Healthcare',
  complianceScore = 98.4,
  openCaps = 2,
  incidentCount = 14,
}: ExecutiveBoardDeckModalProps) {
  const [activeSlide, setActiveSlide] = useState(1);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-teal-500/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Executive Board Presentation Deck</h2>
              <p className="text-xs text-slate-400">Quarterly Compliance, Risk & QAPI Board Briefing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 text-xs font-bold transition-all shadow-lg"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF Deck
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs">
          {[
            { id: 1, label: 'Slide 1: Title & Overview' },
            { id: 2, label: 'Slide 2: Compliance Scorecard' },
            { id: 3, label: 'Slide 3: Risk & Incident Trend' },
            { id: 4, label: 'Slide 4: QAPI Projects' },
            { id: 5, label: 'Slide 5: Board Recommendations' },
          ].map((slide) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(slide.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap',
                activeSlide === slide.id
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>

        {/* Slide Preview Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-6 shadow-inner print:border-none print:bg-white print:text-black">
          {/* SLIDE 1 */}
          {activeSlide === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-teal-500/30 pb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Quarterly Board Briefing
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
                  Hospital Compliance & Risk Management Report
                </h1>
                <p className="text-base text-teal-300 font-semibold mt-2">{facilityName}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Prepared for: Board of Directors & Executive Quality Committee • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-slate-400">Compliance Health Index</p>
                  <p className="text-3xl font-black text-teal-400 mt-1">{complianceScore}%</p>
                  <p className="text-[10px] text-teal-300">TJC / CMS / ADHS Compliant</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-slate-400">Open CAP Items</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">{openCaps}</p>
                  <p className="text-[10px] text-slate-400">On-track for closure</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-slate-400">90-Day Incident Total</p>
                  <p className="text-3xl font-black text-cyan-300 mt-1">{incidentCount}</p>
                  <p className="text-[10px] text-cyan-400">0 Unreported Sentinels</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2 */}
          {activeSlide === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-400" /> 90-Day Regulatory & Quality Scorecard
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>Joint Commission CAMH Survey Preparedness</span>
                  <span className="font-bold text-teal-400">100% Ready (Mock Survey Cleared)</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>CMS Conditions of Participation (42 CFR 482) Review</span>
                  <span className="font-bold text-teal-400">Fully Compliant</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>Arizona ADHS R9-10 License & Title 36 Holds</span>
                  <span className="font-bold text-teal-400">100% Audited</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span>Mandatory Staff Training & Competency Gatekeeper</span>
                  <span className="font-bold text-cyan-300">96.5% Completion Rate</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3 */}
          {activeSlide === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" /> Incident Distribution & Risk Heatmap
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-teal-300">Incidents by Category (Last 90 Days)</p>
                  <p className="text-slate-300">Medication Variance: 5</p>
                  <p className="text-slate-300">Patient Falls (No Injury): 4</p>
                  <p className="text-slate-300">Patient Grievances: 3</p>
                  <p className="text-slate-300">Restraint / Seclusion Time Audit: 2</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-teal-300">Root Cause Analyses (RCAs)</p>
                  <p className="text-slate-300">RCAs Completed: 2</p>
                  <p className="text-slate-300">RCAs Approved by Leadership: 2</p>
                  <p className="text-slate-300">Submitted to TJC Sentinel Database: 0 Required</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4 */}
          {activeSlide === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-400" /> QAPI Performance Improvement Projects
              </h2>

              <div className="space-y-3 text-xs">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="font-bold text-teal-300">PIP 1: Hand Hygiene Compliance Threshold</p>
                  <p className="text-slate-300">Target: &gt;= 95% • Achieved: 97.2% across all patient care units.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="font-bold text-teal-300">PIP 2: Restraint Order Timeliness & Debriefing</p>
                  <p className="text-slate-300">Target: 100% order sign-off within 1 hour • Achieved: 100%.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5 */}
          {activeSlide === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-400" /> Board Recommendations & Next Steps
              </h2>

              <ul className="space-y-2.5 text-xs text-slate-300 list-disc pl-5">
                <li>Approve Q3 QAPI Plan of Correction and annual policy renewals.</li>
                <li>Maintain active automated training gatekeeper restrictions for mandatory CPR/CPI renewals.</li>
                <li>Continue unannounced mock tracer rounds twice monthly through year-end.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSlide((prev) => Math.max(1, prev - 1))}
              disabled={activeSlide === 1}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              ← Previous Slide
            </button>
            <button
              onClick={() => setActiveSlide((prev) => Math.min(5, prev + 1))}
              disabled={activeSlide === 5}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              Next Slide →
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg"
          >
            <Printer className="w-4 h-4" /> Print / Export Board PDF
          </button>
        </div>
      </div>
    </div>
  );
}
