'use client';

import { useState } from 'react';
import { Building2, ShieldAlert, CheckCircle2, AlertCircle, FileText, ArrowRight, Eye, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';

interface RoomNode {
  id: string;
  roomNumber: string;
  unit: string;
  acuity: 'Acute' | 'Sub-Acute' | 'High Acuity' | 'Outpatient';
  ligatureStatus: 'COMPLIANT' | 'NEEDS_AUDIT' | 'CAP_PENDING';
  fireExitStatus: 'PASSED' | 'INSPECTION_DUE';
  waterTempStatus: 'NORMAL' | 'CHECK_REQUIRED';
  lastAudited: string;
  notes: string;
}

const ROOM_NODES: RoomNode[] = [
  { id: '101', roomNumber: 'Room 101', unit: 'Unit 1 Acute Psych', acuity: 'Acute', ligatureStatus: 'COMPLIANT', fireExitStatus: 'PASSED', waterTempStatus: 'NORMAL', lastAudited: '2026-02-01', notes: 'Tamper-resistant hardware installed. 100% compliant.' },
  { id: '102', roomNumber: 'Room 102', unit: 'Unit 1 Acute Psych', acuity: 'Acute', ligatureStatus: 'CAP_PENDING', fireExitStatus: 'PASSED', waterTempStatus: 'NORMAL', lastAudited: '2026-02-05', notes: 'Bathroom door hinge requires tamper-proof plate (CAP-2026-002).' },
  { id: '103', roomNumber: 'Room 103', unit: 'Unit 1 Acute Psych', acuity: 'High Acuity', ligatureStatus: 'COMPLIANT', fireExitStatus: 'PASSED', waterTempStatus: 'NORMAL', lastAudited: '2026-02-08', notes: 'Continuous Q15 observation room. Zero risk fixtures.' },
  { id: '104', roomNumber: 'Room 104', unit: 'Unit 1 Acute Psych', acuity: 'Acute', ligatureStatus: 'NEEDS_AUDIT', fireExitStatus: 'INSPECTION_DUE', waterTempStatus: 'NORMAL', lastAudited: '2026-01-14', notes: 'Quarterly environmental audit due in 3 days.' },
  { id: '201', roomNumber: 'Room 201', unit: 'Unit 2 Sub-Acute', acuity: 'Sub-Acute', ligatureStatus: 'COMPLIANT', fireExitStatus: 'PASSED', waterTempStatus: 'NORMAL', lastAudited: '2026-02-02', notes: 'Sub-acute unit. All shower heads anti-ligature.' },
  { id: '202', roomNumber: 'Room 202', unit: 'Unit 2 Sub-Acute', acuity: 'Sub-Acute', ligatureStatus: 'COMPLIANT', fireExitStatus: 'PASSED', waterTempStatus: 'CHECK_REQUIRED', lastAudited: '2026-02-04', notes: 'Hot water temp recorded at 112°F (target 105-110°F).' },
];

export default function HospitalFloorplanPage() {
  const [selectedRoom, setSelectedRoom] = useState<RoomNode>(ROOM_NODES[1]);
  const [unitFilter, setUnitFilter] = useState<string>('ALL');

  const filteredRooms = ROOM_NODES.filter(
    (r) => unitFilter === 'ALL' || r.unit.includes(unitFilter)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-teal-600" />
            Hospital Unit & Ligature Risk Heatmap
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Destiny Springs Healthcare · 90 Beds Inpatient Psych Architectural Layout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/eoc"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            ← Environment of Care
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 bg-card border border-border p-3 rounded-2xl">
        <Filter className="w-4 h-4 text-muted-foreground ml-1" />
        <span className="text-xs font-bold text-foreground">Filter Unit:</span>
        {['ALL', 'Unit 1', 'Unit 2'].map((unit) => (
          <button
            key={unit}
            onClick={() => setUnitFilter(unit)}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
              unitFilter === unit
                ? 'bg-teal-600 text-white'
                : 'bg-muted/60 text-slate-400 hover:text-foreground'
            }`}
          >
            {unit === 'ALL' ? 'All Units (90 Beds)' : unit}
          </button>
        ))}
      </div>

      {/* Interactive Floorplan Grid & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floorplan Layout Grid */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" /> Click Any Room to View Audit Dossier
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">● Compliant</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">● Audit Due</span>
              <span className="flex items-center gap-1 text-red-400 font-bold">● CAP Pending</span>
            </div>
          </div>

          {/* Graphical Room Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoom.id === room.id;
              const isCapPending = room.ligatureStatus === 'CAP_PENDING';
              const isAuditDue = room.ligatureStatus === 'NEEDS_AUDIT';

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-teal-400 bg-teal-950/40 ring-2 ring-teal-500/40 shadow-xl'
                      : isCapPending
                      ? 'border-red-500/40 bg-red-950/20 hover:bg-red-950/40'
                      : isAuditDue
                      ? 'border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{room.roomNumber}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCapPending
                          ? 'bg-red-500 animate-ping'
                          : isAuditDue
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{room.unit}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {room.acuity}
                    </span>
                    <span className="text-slate-400 font-mono">{room.lastAudited}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Room Audit Detail Drawer */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-base">{selectedRoom.roomNumber}</h3>
              <p className="text-xs text-muted-foreground">{selectedRoom.unit}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 border border-teal-500/30">
              {selectedRoom.acuity}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
              <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">
                Ligature Risk Fixture Status
              </span>
              <div className="flex items-center gap-2">
                {selectedRoom.ligatureStatus === 'COMPLIANT' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-600">100% Anti-Ligature Compliant</span>
                  </>
                )}
                {selectedRoom.ligatureStatus === 'CAP_PENDING' && (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="font-bold text-red-600">CAP-2026-002 Pending Repair</span>
                  </>
                )}
                {selectedRoom.ligatureStatus === 'NEEDS_AUDIT' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-amber-600">Quarterly Audit Due</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
              <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">
                Auditor Notes & Observations
              </span>
              <p className="text-muted-foreground leading-relaxed">{selectedRoom.notes}</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/eoc"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-md"
            >
              <FileText className="w-4 h-4" /> Open Full Room Audit Record
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
