'use client';

import { useState } from 'react';
import {
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Wrench,
  Building2,
  ShieldAlert,
  ChevronRight,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCheck {
  id: string;
  item: string;
  category: 'Ligature Safety' | 'Physical Environmental' | 'Infection Control';
  status: 'passed' | 'failed' | 'na';
  severity?: 'critical' | 'high' | 'moderate';
  note?: string;
}

export default function LigatureRoundingPage() {
  const [selectedUnit, setSelectedUnit] = useState('Unit 1 (Acute Psych)');
  const [selectedRoom, setSelectedRoom] = useState('Room 104');
  const [inspectorName, setInspectorName] = useState('Sarah Jenkins (EOC Safety Officer)');

  const [checks, setChecks] = useState<RoomCheck[]>([
    {
      id: 'check-1',
      item: 'Door Top Sensor & Anti-Ligature Hinge Integrity',
      category: 'Ligature Safety',
      status: 'passed',
    },
    {
      id: 'check-2',
      item: 'Bathroom Shower Head & Towel Hook Breakaway Weight Load',
      category: 'Ligature Safety',
      status: 'passed',
    },
    {
      id: 'check-3',
      item: 'Sprinkler Head & Ceiling Fixture Flush Recesses',
      category: 'Ligature Safety',
      status: 'failed',
      severity: 'high',
      note: 'Minor gap detected around sprinkler bezel ring in Room 104 bathroom. Maintenance ticket auto-generated.',
    },
    {
      id: 'check-4',
      item: 'Tamper-Proof Torx Screws on Window Guard & HVAC Grille',
      category: 'Physical Environmental',
      status: 'passed',
    },
    {
      id: 'check-5',
      item: 'Hand Hygiene Dispenser Full & Operating Correctly',
      category: 'Infection Control',
      status: 'passed',
    },
  ]);

  const toggleCheck = (id: string, newStatus: 'passed' | 'failed') => {
    setChecks(
      checks.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      )
    );
  };

  const passCount = checks.filter((c) => c.status === 'passed').length;
  const failCount = checks.filter((c) => c.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Mobile Rounding Suite
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <HardHat className="w-6 h-6 text-amber-400" /> Behavioral Health Ligature & EOC Rounding
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Conduct daily environmental safety rounds, test anti-ligature fixtures, and dispatch maintenance work orders.
          </p>
        </div>

        <button
          onClick={() => alert('Ligature Risk Rounding Report submitted & logged to EOC Vault.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md flex-shrink-0"
        >
          <FileCheck className="w-4 h-4" /> Submit Rounding Audit
        </button>
      </div>

      {/* Selector Card */}
      <div className="bg-card border border-border rounded-2xl p-4 grid sm:grid-cols-3 gap-3 shadow-sm">
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Patient Unit
          </label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl font-semibold"
          >
            <option>Unit 1 (Acute Psych Inpatient)</option>
            <option>Unit 2 (Sub-Acute & IOP)</option>
            <option>Unit 3 (Geriatric Psych)</option>
            <option>Seclusion Suite A & B</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Room / Location
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl font-semibold"
          >
            <option>Room 101</option>
            <option>Room 102</option>
            <option>Room 103</option>
            <option>Room 104 (In Inspection)</option>
            <option>Patient Dayroom 1</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Rounding Auditor
          </label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            className="w-full text-xs p-2.5 bg-muted border border-border rounded-xl font-semibold"
          />
        </div>
      </div>

      {/* Audit Progress Bar */}
      <div className="bg-muted/40 border border-border/60 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground">
            {selectedRoom} Inspection Progress ({passCount}/{checks.length} Passed)
          </p>
          <p className="text-[11px] text-muted-foreground">
            {failCount > 0 ? (
              <span className="text-amber-400 font-semibold">{failCount} Environmental Hazard Logged</span>
            ) : (
              <span className="text-green-400">All Checked Fixtures Compliant</span>
            )}
          </p>
        </div>

        <div className="w-36 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${(passCount / checks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Anti-Ligature & Safety Fixture Checklist
        </h2>

        {checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              'bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-sm',
              check.status === 'passed' && 'border-border/60 hover:border-amber-500/30',
              check.status === 'failed' && 'border-red-500/40 bg-red-950/10'
            )}
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {check.category}
                </span>
                {check.severity && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                    {check.severity} Severity
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-foreground">{check.item}</p>
              {check.note && <p className="text-[11px] text-amber-300 mt-1">{check.note}</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCheck(check.id, 'passed')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  check.status === 'passed'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
              </button>

              <button
                type="button"
                onClick={() => toggleCheck(check.id, 'failed')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  check.status === 'failed'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Fail / Hazard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
