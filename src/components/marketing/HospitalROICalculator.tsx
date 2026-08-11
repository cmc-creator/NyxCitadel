'use client';

import { useState } from 'react';
import {
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export function HospitalROICalculator() {
  const [beds, setBeds] = useState(120);
  const [ftes, setFtes] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(65);

  // Calculations
  const hoursSavedPerFtePerWeek = 6;
  const annualHoursSaved = ftes * hoursSavedPerFtePerWeek * 50;
  const laborSavings = annualHoursSaved * hourlyRate;

  // Fine avoidance & survey penalty reduction estimate based on bed size
  const fineAvoidanceEstimate = Math.round(beds * 450);

  // Board report preparation savings (approx 18 hours per quarter per FTE)
  const boardReportSavings = Math.round(ftes * 18 * 4 * hourlyRate * 0.8);

  const totalAnnualValue = laborSavings + fineAvoidanceEstimate + boardReportSavings;

  return (
    <div className="bg-card border border-teal-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Hospital Compliance ROI Calculator
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Interactive
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Calculate your facility's projected annual financial and labor savings with NyxCitadel.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sliders Input */}
        <div className="space-y-6 bg-muted/30 border border-border/60 rounded-xl p-5">
          {/* Slider 1: Bed Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" /> Licensed Bed Capacity
              </label>
              <span className="font-bold text-teal-400 text-base">{beds} Beds</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={beds}
              onChange={(e) => setBeds(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10 Beds</span>
              <span>250 Beds</span>
              <span>500+ Beds</span>
            </div>
          </div>

          {/* Slider 2: FTE Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Compliance & Quality Staff (FTEs)
              </label>
              <span className="font-bold text-teal-400 text-base">{ftes} FTEs</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={ftes}
              onChange={(e) => setFtes(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 FTE</span>
              <span>10 FTEs</span>
              <span>25 FTEs</span>
            </div>
          </div>

          {/* Slider 3: Average Hourly Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" /> Avg. Staff Hourly Rate (Fully Loaded)
              </label>
              <span className="font-bold text-teal-400 text-base">${hourlyRate}/hr</span>
            </div>
            <input
              type="range"
              min={35}
              max={120}
              step={5}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>$35/hr</span>
              <span>$75/hr</span>
              <span>$120/hr</span>
            </div>
          </div>
        </div>

        {/* Results Output */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-teal-950/20 border border-teal-700/30 rounded-xl p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" /> Annual Labor Saved
              </p>
              <p className="text-2xl font-extrabold text-teal-300">
                {annualHoursSaved.toLocaleString()} hrs
              </p>
              <p className="text-[10px] text-teal-400/80">~{hoursSavedPerFtePerWeek} hrs/week per FTE</p>
            </div>

            <div className="bg-teal-950/20 border border-teal-700/30 rounded-xl p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-400" /> Staff Productivity Savings
              </p>
              <p className="text-2xl font-extrabold text-teal-300">
                ${laborSavings.toLocaleString()}
              </p>
              <p className="text-[10px] text-teal-400/80">Reclaimed administrative time</p>
            </div>

            <div className="bg-teal-950/20 border border-teal-700/30 rounded-xl p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Fine & Deficiency Risk Mitigation
              </p>
              <p className="text-2xl font-extrabold text-teal-300">
                ${fineAvoidanceEstimate.toLocaleString()}
              </p>
              <p className="text-[10px] text-teal-400/80">Based on ADHS & CMS penalty benchmarks</p>
            </div>

            <div className="bg-teal-950/20 border border-teal-700/30 rounded-xl p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-teal-400" /> Board Report Prep Value
              </p>
              <p className="text-2xl font-extrabold text-teal-300">
                ${boardReportSavings.toLocaleString()}
              </p>
              <p className="text-[10px] text-teal-400/80">Automated quarterly board reporting</p>
            </div>
          </div>

          {/* Grand Total Callout */}
          <div className="bg-gradient-to-r from-teal-950 to-cyan-950 border border-teal-500/40 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-teal-400 font-bold">
                Projected Total Annual Value
              </p>
              <p className="text-3xl font-black text-white mt-0.5">
                ${totalAnnualValue.toLocaleString()}
                <span className="text-sm font-semibold text-teal-300"> / year</span>
              </p>
            </div>

            <Link
              href="/contact"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 text-xs font-bold transition-all shadow-lg flex-shrink-0"
            >
              Get Custom Quote <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
