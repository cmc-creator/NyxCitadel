'use client';

import { useState } from 'react';
import {
  Building2,
  BarChart2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  CheckCircle2,
  Search,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FacilityScorecard {
  id: string;
  name: string;
  location: string;
  beds: number;
  complianceScore: number;
  surveyStatus: 'Compliant' | 'Survey Window Active' | 'ADHS Audit Pending';
  openCaps: number;
  trainingRate: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

const FACILITIES: FacilityScorecard[] = [
  {
    id: 'fac-1',
    name: 'Destiny Springs Healthcare',
    location: 'Peoria, AZ',
    beds: 120,
    complianceScore: 98.4,
    surveyStatus: 'Compliant',
    openCaps: 2,
    trainingRate: 96.5,
    riskLevel: 'Low',
  },
  {
    id: 'fac-2',
    name: 'Banner Behavioral Health System',
    location: 'Phoenix, AZ',
    beds: 210,
    complianceScore: 94.2,
    surveyStatus: 'Survey Window Active',
    openCaps: 5,
    trainingRate: 92.1,
    riskLevel: 'Moderate',
  },
  {
    id: 'fac-3',
    name: 'HonorHealth Behavioral Medical Center',
    location: 'Scottsdale, AZ',
    beds: 140,
    complianceScore: 96.8,
    surveyStatus: 'Compliant',
    openCaps: 3,
    trainingRate: 95.0,
    riskLevel: 'Low',
  },
  {
    id: 'fac-4',
    name: 'Mayo Clinic Behavioral Health Facility',
    location: 'Phoenix, AZ',
    beds: 95,
    complianceScore: 99.1,
    surveyStatus: 'Compliant',
    openCaps: 1,
    trainingRate: 99.0,
    riskLevel: 'Low',
  },
];

export default function EnterpriseCommandPage() {
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  const totalBeds = FACILITIES.reduce((acc, f) => acc + f.beds, 0);
  const avgScore = (
    FACILITIES.reduce((acc, f) => acc + f.complianceScore, 0) / FACILITIES.length
  ).toFixed(1);
  const totalOpenCaps = FACILITIES.reduce((acc, f) => acc + f.openCaps, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Enterprise Governance Mode
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Globe className="w-7 h-7 text-teal-400" /> Multi-Facility System Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Executive oversight, side-by-side compliance scorecards, and regional risk benchmarking across all health system facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Exporting System-Wide Executive Enterprise Scorecard PDF...')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Export Enterprise PDF Report
          </button>
        </div>
      </div>

      {/* Enterprise Key KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-teal-500/30 rounded-2xl p-5 space-y-1 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-400" /> Health System Network
          </p>
          <p className="text-3xl font-black text-foreground">4 Facilities</p>
          <p className="text-[10px] text-teal-400 font-medium">{totalBeds} Total Licensed Beds</p>
        </div>

        <div className="bg-card border border-teal-500/30 rounded-2xl p-5 space-y-1 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> System Compliance Avg
          </p>
          <p className="text-3xl font-black text-teal-300">{avgScore}%</p>
          <p className="text-[10px] text-muted-foreground">TJC / CMS / ADHS Standards</p>
        </div>

        <div className="bg-card border border-teal-500/30 rounded-2xl p-5 space-y-1 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Total Open System CAPs
          </p>
          <p className="text-3xl font-black text-amber-400">{totalOpenCaps} CAPs</p>
          <p className="text-[10px] text-amber-400/80">Across all 4 facilities</p>
        </div>

        <div className="bg-card border border-teal-500/30 rounded-2xl p-5 space-y-1 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Workforce Compliance Rate
          </p>
          <p className="text-3xl font-black text-cyan-300">95.7%</p>
          <p className="text-[10px] text-cyan-400 font-medium">100% Gatekeeper Active</p>
        </div>
      </div>

      {/* Side-by-Side Facility Scorecards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" /> Regional Facility Scorecards
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FACILITIES.map((fac) => (
            <div
              key={fac.id}
              className="bg-card border border-border hover:border-teal-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    {fac.beds} Beds
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                      fac.riskLevel === 'Low' && 'bg-green-500/20 text-green-300',
                      fac.riskLevel === 'Moderate' && 'bg-amber-500/20 text-amber-300'
                    )}
                  >
                    {fac.riskLevel} Risk
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-teal-300 transition-colors">
                  {fac.name}
                </h3>
                <p className="text-xs text-muted-foreground">{fac.location}</p>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Compliance Score:</span>
                  <span className="font-bold text-teal-300">{fac.complianceScore}%</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Open CAPs:</span>
                  <span className="font-bold text-amber-400">{fac.openCaps}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Staff Training:</span>
                  <span className="font-bold text-cyan-300">{fac.trainingRate}%</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Switching dashboard view to ${fac.name}...`)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted hover:bg-teal-950/40 border border-border text-xs font-semibold text-foreground group-hover:border-teal-500/40 transition-all"
              >
                Inspect Facility <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Policy Standardization & Alignment Matrix */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Cross-Facility Policy Alignment & Standardization</h2>
            <p className="text-xs text-muted-foreground">Ensuring unified corporate clinical policies across all member hospitals.</p>
          </div>
          <span className="text-xs text-teal-400 font-semibold bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-full">
            96% Standardized
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
            <span className="font-semibold text-foreground">Restraint & Seclusion Corporate Policy (SYS-POL-2024-04)</span>
            <span className="text-green-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 Facilities Synced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
            <span className="font-semibold text-foreground">Emergency Management & HVA Plan (SYS-POL-EM-01)</span>
            <span className="text-green-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 Facilities Synced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
            <span className="font-semibold text-foreground">Infection Control & ICRA Outbreak Protocol (SYS-POL-IC-12)</span>
            <span className="text-amber-400 font-bold">1 Facility Update Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
