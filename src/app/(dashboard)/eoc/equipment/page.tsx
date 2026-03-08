'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, Flame, Zap, Wind, Lock, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';

const equipment = [
  // OVERDUE
  { id: 'PM-2026-001', name: 'Kitchen Hood Suppression System (Ansul R-102)', assetId: 'FS-HOOD-01', category: 'FIRE_SUPPRESSION', location: 'Dietary – Kitchen', frequency: 'SEMI_ANNUAL', lastService: '2025-09-05', nextService: '2026-03-05', vendor: 'Ansul Service AZ', contactPhone: '(623) 555-0190', status: 'OVERDUE', notes: 'Service scheduled 3/20/2026. Tag expired 3/5. Document in EOC committee minutes.' },
  { id: 'PM-2026-002', name: 'Emergency Exit Lighting – North Wing', assetId: 'EL-N-WING-01', category: 'EMERGENCY_LIGHTING', location: 'North Hallway – 1st Floor', frequency: 'ANNUAL', lastService: '2025-02-10', nextService: '2026-02-10', vendor: 'Arizona Life Safety LLC', contactPhone: '(602) 555-0141', status: 'OVERDUE', notes: '30-second and 90-minute battery test overdue. Schedule with ALS.' },
  // DUE SOON
  { id: 'PM-2026-003', name: 'Fire Alarm Panel – Notifier NFS2-3030', assetId: 'FA-PANEL-MAIN', category: 'FIRE_ALARM', location: 'Main Electrical Room', frequency: 'ANNUAL', lastService: '2025-03-18', nextService: '2026-03-18', vendor: 'Arizona Fire Systems', contactPhone: '(602) 555-0182', status: 'DUE_SOON', notes: 'Full panel inspection includes detector testing and sprinkler flow test.' },
  { id: 'PM-2026-004', name: 'Emergency Generator – Cummins 500kW diesel', assetId: 'GEN-MAIN-01', category: 'GENERATOR', location: 'Exterior – East Mechanical Pad', frequency: 'MONTHLY', lastService: '2026-02-07', nextService: '2026-03-07', vendor: 'Cummins Power Systems – AZ', contactPhone: '(602) 555-0175', status: 'DUE_SOON', notes: 'Monthly load test: run under load for 30 minutes. Log fuel level and battery voltage.' },
  { id: 'PM-2026-005', name: 'Fire Extinguishers – All Areas (42 units)', assetId: 'FE-ALL', category: 'FIRE_SUPPRESSION', location: 'Facility-wide', frequency: 'ANNUAL', lastService: '2025-03-15', nextService: '2026-03-15', vendor: 'Phoenix Fire Equipment', contactPhone: '(602) 555-0163', status: 'DUE_SOON', notes: 'Annual certification + 6-year inspection for applicable units.' },
  // UPCOMING
  { id: 'PM-2026-006', name: 'Elevator – Kone MiniSpace (Wing A)', assetId: 'ELV-WING-A', category: 'ELEVATOR', location: 'Wing A – 1st/2nd Floor', frequency: 'ANNUAL', lastService: '2025-04-01', nextService: '2026-04-01', vendor: 'KONE Americas', contactPhone: '(602) 555-0199', status: 'UPCOMING', notes: 'State-required annual certification by AZ Elevator Safety. 30-day notice to state.' },
  { id: 'PM-2026-007', name: 'Backflow Preventer – Main Domestic Water', assetId: 'BF-DOMESTIC-01', category: 'PLUMBING', location: 'Main Mechanical Room', frequency: 'ANNUAL', lastService: '2025-04-15', nextService: '2026-04-15', vendor: 'Southwest Backflow Services', contactPhone: '(602) 555-0144', status: 'UPCOMING', notes: 'Submit test report to Peoria Water Services within 30 days of test.' },
  { id: 'PM-2026-008', name: 'AHU-1 – Air Handling Unit (Acute Unit)', assetId: 'HVAC-AHU-1', category: 'HVAC', location: 'Roof – Acute Unit Zone', frequency: 'QUARTERLY', lastService: '2026-01-10', nextService: '2026-04-10', vendor: 'Comfort Systems AZ', contactPhone: '(602) 555-0177', status: 'UPCOMING', notes: 'Change MERV-14 filters, check coils, verify negative pressure in patient rooms.' },
  { id: 'PM-2026-009', name: 'Nurse Call System – Rauland Responder 5', assetId: 'NC-SYS-01', category: 'NURSE_CALL', location: 'Acute Adult Unit / Adolescent Unit', frequency: 'ANNUAL', lastService: '2025-04-20', nextService: '2026-04-20', vendor: 'Rauland-Borg Corp', contactPhone: '(847) 555-0133', status: 'UPCOMING', notes: '' },
  // COMPLETED
  { id: 'PM-2026-010', name: 'Sprinkler System – Quarterly Inspection', assetId: 'SPK-ALL', category: 'FIRE_SUPPRESSION', location: 'Facility-wide', frequency: 'QUARTERLY', lastService: '2026-01-20', nextService: '2026-04-20', vendor: 'Arizona Fire Systems', contactPhone: '(602) 555-0182', status: 'COMPLETED', notes: 'Q1 2026 inspection certificate posted in EOC binder. No deficiencies found.' },
  { id: 'PM-2026-011', name: 'Security Camera System – Annual Review', assetId: 'SEC-CAM-ALL', category: 'SECURITY_SYSTEM', location: 'Facility-wide', frequency: 'ANNUAL', lastService: '2026-02-15', nextService: '2027-02-15', vendor: 'Integrated Security Solutions', contactPhone: '(602) 555-0188', status: 'COMPLETED', notes: 'All 34 cameras verified operational. Retention set to 90 days per policy.' },
];

const categoryIcon: Record<string, React.ElementType> = {
  FIRE_SUPPRESSION: Flame,
  FIRE_ALARM: Flame,
  EMERGENCY_LIGHTING: Zap,
  GENERATOR: Zap,
  HVAC: Wind,
  MEDICAL_GAS: Wind,
  ELEVATOR: Wrench,
  SECURITY_SYSTEM: Lock,
  PLUMBING: Wrench,
  ELECTRICAL: Zap,
  MEDICAL_EQUIPMENT: Wrench,
  NURSE_CALL: Wrench,
  DOOR_HARDWARE: Lock,
};

const categoryColor: Record<string, string> = {
  FIRE_SUPPRESSION: 'text-red-400',
  FIRE_ALARM: 'text-red-400',
  EMERGENCY_LIGHTING: 'text-amber-400',
  GENERATOR: 'text-orange-400',
  HVAC: 'text-sky-400',
  SECURITY_SYSTEM: 'text-purple-400',
  PLUMBING: 'text-teal-400',
  ELECTRICAL: 'text-yellow-400',
  NURSE_CALL: 'text-blue-400',
  ELEVATOR: 'text-slate-400',
  MEDICAL_EQUIPMENT: 'text-emerald-400',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OVERDUE: { label: 'OVERDUE', color: 'bg-red-950/40 text-red-400 border border-red-700/40', icon: AlertTriangle },
  DUE_SOON: { label: 'DUE SOON', color: 'bg-amber-950/40 text-amber-400 border border-amber-700/40', icon: Clock },
  UPCOMING: { label: 'UPCOMING', color: 'bg-sky-950/40 text-sky-400 border border-sky-700/40', icon: Clock },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-purple-950/40 text-purple-400 border border-purple-700/40', icon: Wrench },
  COMPLETED: { label: 'COMPLETED', color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-700/40', icon: CheckCircle2 },
};

const frequencyLabel: Record<string, string> = {
  WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual', ANNUAL: 'Annual', AS_NEEDED: 'As Needed',
};

type StatusFilter = 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'COMPLETED';

export default function EquipmentPmPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filtered = equipment.filter(e => statusFilter === 'ALL' || e.status === statusFilter);

  const countByStatus = (s: string) => equipment.filter(e => e.status === s).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Equipment PM</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Equipment Preventive Maintenance</h1>
          <p className="text-sm text-slate-400 mt-0.5">Fire systems, utilities, HVAC, elevators, and clinical support equipment schedules</p>
        </div>
        <button className="px-3 py-1.5 text-sm rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors">
          + Add Equipment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Overdue', key: 'OVERDUE', color: 'text-red-400', bg: 'border-red-700/40 bg-red-950/30' },
          { label: 'Due Soon', key: 'DUE_SOON', color: 'text-amber-400', bg: 'border-amber-700/40 bg-amber-950/30' },
          { label: 'Upcoming', key: 'UPCOMING', color: 'text-sky-400', bg: 'border-sky-700/40 bg-sky-950/30' },
          { label: 'In Progress', key: 'IN_PROGRESS', color: 'text-purple-400', bg: 'border-purple-700/40 bg-purple-950/30' },
          { label: 'Completed', key: 'COMPLETED', color: 'text-emerald-400', bg: 'border-emerald-700/40 bg-emerald-950/30' },
        ].map(s => (
          <div key={s.key} className={`p-3 rounded-lg border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{countByStatus(s.key)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        {(['ALL','OVERDUE','DUE_SOON','UPCOMING','COMPLETED'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filtered.length} items</span>
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {filtered.map(e => {
          const Icon = categoryIcon[e.category] ?? Wrench;
          const iconColor = categoryColor[e.category] ?? 'text-slate-400';
          const sc = statusConfig[e.status];
          const StatusIcon = sc.icon;
          const isOverdue = e.status === 'OVERDUE';
          return (
            <div key={e.id} className={`p-4 rounded-xl border bg-card transition-colors hover:border-slate-500/50 ${isOverdue ? 'border-red-700/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-slate-900/60 shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">{e.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{e.location} · <span className="text-slate-600">{e.assetId}</span></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{frequencyLabel[e.frequency]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span>Last service: <span className={`font-medium ${e.lastService ? 'text-slate-300' : 'text-red-400'}`}>{e.lastService ?? 'Never'}</span></span>
                    <span>Next due: <span className={`font-medium ${isOverdue ? 'text-red-400' : e.status === 'DUE_SOON' ? 'text-amber-400' : 'text-slate-300'}`}>{e.nextService}</span></span>
                    <span>Vendor: <span className="text-slate-400">{e.vendor}</span></span>
                    {e.contactPhone && <span><span className="text-slate-400">{e.contactPhone}</span></span>}
                  </div>
                  {e.notes && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{e.notes}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
