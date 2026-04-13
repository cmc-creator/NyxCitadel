import Link from 'next/link';
import { ChevronRight, Settings } from 'lucide-react';

interface DeptLink {
  href: string;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const DEPT_MAP: Record<string, { color: string; links: DeptLink[] }> = {
  'Nursing': {
    color: 'border-blue-500/30 bg-blue-500/5',
    links: [
      { href: '/trackers/incidents',               label: 'Incident Reports' },
      { href: '/restraint-seclusion',              label: 'Restraint & Seclusion',    badge: 'CMS', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/patient-rights',                   label: 'Patient Rights',           badge: 'CMS', badgeColor: 'bg-rose-100 text-rose-700' },
      { href: '/infection-control/hand-hygiene',   label: 'Hand Hygiene' },
      { href: '/infection-control/hai',            label: 'HAI Surveillance' },
      { href: '/trackers/training',                label: 'Training & Competency' },
    ],
  },
  'Social Services': {
    color: 'border-purple-500/30 bg-purple-500/5',
    links: [
      { href: '/patient-rights',                   label: 'Patient Rights',           badge: 'CMS', badgeColor: 'bg-rose-100 text-rose-700' },
      { href: '/patient-rights/advance-directives',label: 'Advance Directives' },
      { href: '/patient-rights/holds',             label: 'Involuntary Holds',        badge: 'Title 36', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/trackers/grievances',              label: 'Patient Grievances' },
      { href: '/discharge-planning',               label: 'Discharge Planning' },
    ],
  },
  'Human Resources': {
    color: 'border-indigo-500/30 bg-indigo-500/5',
    links: [
      { href: '/credentialing/providers',          label: 'Provider Directory' },
      { href: '/credentialing/oppe',               label: 'OPPE / FPPE' },
      { href: '/trackers/training',                label: 'Training & Competency' },
      { href: '/workforce-health/employee-health', label: 'Employee Health' },
      { href: '/workforce-health/osha',            label: 'OSHA 300 Log' },
      { href: '/emergency/drills',                 label: 'Drills & Exercises' },
    ],
  },
  'Culinary / Food Services': {
    color: 'border-amber-500/30 bg-amber-500/5',
    links: [
      { href: '/infection-control',                label: 'Infection Control' },
      { href: '/infection-control/outbreaks',      label: 'Outbreak Tracking' },
      { href: '/trackers/training',                label: 'Training & Competency' },
      { href: '/eoc/rounds',                       label: 'EOC Safety Rounds' },
      { href: '/trackers/incidents',               label: 'Incident Reports' },
    ],
  },
  'Plant Operations': {
    color: 'border-orange-500/30 bg-orange-500/5',
    links: [
      { href: '/eoc/rounds',                       label: 'EOC Safety Rounds' },
      { href: '/eoc/deficiencies',                 label: 'EOC Deficiencies' },
      { href: '/eoc/equipment',                    label: 'Equipment PM' },
      { href: '/eoc/ligature',                     label: 'Ligature Risk',     badge: 'TJC', badgeColor: 'bg-amber-100 text-amber-700' },
      { href: '/emergency/hva',                    label: 'HVA Assessment' },
    ],
  },
  'Environmental Services (EVS)': {
    color: 'border-teal-500/30 bg-teal-500/5',
    links: [
      { href: '/infection-control',                label: 'Infection Control' },
      { href: '/infection-control/hai',            label: 'HAI Surveillance' },
      { href: '/eoc/rounds',                       label: 'EOC Safety Rounds' },
      { href: '/trackers/training',                label: 'Training & Competency' },
      { href: '/trackers/incidents',               label: 'Incident Reports' },
    ],
  },
  'Pharmacy': {
    color: 'border-emerald-500/30 bg-emerald-500/5',
    links: [
      { href: '/pharmacy',                         label: 'Pharmacy Dashboard' },
      { href: '/pharmacy/controlled-substances',   label: 'Controlled Substances' },
      { href: '/pharmacy/high-alert',              label: 'High-Alert Meds' },
      { href: '/pharmacy/pdmp',                    label: 'PDMP Check Log' },
      { href: '/trackers/incidents',               label: 'Medication Incidents' },
    ],
  },
  'Quality / QAPI': {
    color: 'border-cyan-500/30 bg-cyan-500/5',
    links: [
      { href: '/quality',                          label: 'QAPI Dashboard' },
      { href: '/quality/metrics',                  label: 'Quality Metrics' },
      { href: '/quality/projects',                 label: 'QAPI Projects' },
      { href: '/trackers/qoc',                     label: 'QOC / LOI Complaints',  badge: 'CMS', badgeColor: 'bg-teal-100 text-teal-700' },
      { href: '/trackers/grievances',              label: 'Patient Grievances' },
      { href: '/trackers/rca',                     label: 'Root Cause Analyses' },
      { href: '/quality/poc',                      label: 'Plans of Correction' },
    ],
  },
  'Risk Management': {
    color: 'border-red-500/30 bg-red-500/5',
    links: [
      { href: '/trackers/risk-assessments',        label: 'Risk Assessments' },
      { href: '/trackers/ir-iad',                  label: 'IR / IAD Incidents',    badge: 'ADHS', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/trackers/incidents',               label: 'Incident Reports' },
      { href: '/trackers/qoc',                     label: 'QOC / LOI Complaints' },
      { href: '/trackers/caps',                    label: 'Corrective Action Plans' },
      { href: '/emergency/hva',                    label: 'HVA Assessment' },
    ],
  },
  'Compliance': {
    color: 'border-violet-500/30 bg-violet-500/5',
    links: [
      { href: '/hipaa',                            label: 'HIPAA / Privacy',        badge: 'HIPAA', badgeColor: 'bg-blue-100 text-blue-700' },
      { href: '/hipaa/breaches',                   label: 'Breach Log' },
      { href: '/hipaa/baa',                        label: 'BAA Tracker' },
      { href: '/patient-rights',                   label: 'Patient Rights' },
      { href: '/trackers/compliance',              label: 'Compliance Items' },
      { href: '/trackers/policies',                label: 'Policies & Procedures' },
    ],
  },
  'Infection Control': {
    color: 'border-lime-500/30 bg-lime-500/5',
    links: [
      { href: '/infection-control',                label: 'Infection Control Overview' },
      { href: '/infection-control/hai',            label: 'HAI Surveillance' },
      { href: '/infection-control/icra',           label: 'ICRA Assessments' },
      { href: '/infection-control/outbreaks',      label: 'Outbreak Tracking' },
      { href: '/infection-control/hand-hygiene',   label: 'Hand Hygiene Audits' },
      { href: '/reporting/nhsn',                   label: 'NHSN HAI Reporting',    badge: 'CDC', badgeColor: 'bg-blue-100 text-blue-700' },
    ],
  },
  'Emergency Management': {
    color: 'border-yellow-500/30 bg-yellow-500/5',
    links: [
      { href: '/emergency/hva',                    label: 'HVA Assessment' },
      { href: '/emergency/drills',                 label: 'Drills & Exercises' },
      { href: '/emergency/plans',                  label: 'EM Plans' },
      { href: '/eoc/rounds',                       label: 'EOC Safety Rounds' },
      { href: '/eoc/deficiencies',                 label: 'EOC Deficiencies' },
    ],
  },
  'Medical Staff': {
    color: 'border-sky-500/30 bg-sky-500/5',
    links: [
      { href: '/credentialing/providers',          label: 'Provider Directory' },
      { href: '/credentialing/oppe',               label: 'OPPE / FPPE',           badge: 'TJC', badgeColor: 'bg-indigo-100 text-indigo-700' },
      { href: '/credentialing/licenses',           label: 'License Tracker' },
      { href: '/trackers/incidents',               label: 'Incident Reports' },
      { href: '/trackers/rca',                     label: 'Root Cause Analyses' },
      { href: '/treatment-plans',                  label: 'Treatment Planning' },
    ],
  },
  'Case Management': {
    color: 'border-fuchsia-500/30 bg-fuchsia-500/5',
    links: [
      { href: '/discharge-planning',               label: 'Discharge Planning',     badge: 'CMS', badgeColor: 'bg-sky-100 text-sky-700' },
      { href: '/patient-rights',                   label: 'Patient Rights' },
      { href: '/patient-rights/advance-directives',label: 'Advance Directives' },
      { href: '/patient-rights/holds',             label: 'Involuntary Holds' },
      { href: '/trackers/grievances',              label: 'Patient Grievances' },
    ],
  },
  'Behavioral Health': {
    color: 'border-rose-500/30 bg-rose-500/5',
    links: [
      { href: '/patient-rights/holds',             label: 'Involuntary Holds',      badge: 'Title 36', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/restraint-seclusion',              label: 'Restraint & Seclusion',  badge: 'CMS', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/patient-rights',                   label: 'Patient Rights' },
      { href: '/trackers/incidents',               label: 'Incident Reports' },
      { href: '/treatment-plans',                  label: 'Treatment Planning' },
    ],
  },
};

// Departments that should see the full dashboard without a panel
const FULL_ACCESS_DEPTS = new Set(['Administration', 'Executive', 'IT / Health Informatics', 'Finance', 'Security']);

interface DepartmentPanelProps {
  department: string | null;
}

export function DepartmentPanel({ department }: DepartmentPanelProps) {
  if (!department) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-800/30 px-4 py-3 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>Set your department to see a personalized quick-start for your role.</span>
        <Link href="/settings/profile" className="flex items-center gap-1 text-teal-400 hover:underline text-xs flex-shrink-0">
          <Settings className="w-3.5 h-3.5" /> Set department
        </Link>
      </div>
    );
  }

  if (FULL_ACCESS_DEPTS.has(department)) {
    return null;
  }

  const config = DEPT_MAP[department];
  if (!config) return null;

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white uppercase tracking-wider">{department} &mdash; Your Quick-Start</p>
        <Link href="/settings/profile" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Change
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {config.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 hover:border-white/20 text-xs font-medium text-slate-200 transition-all"
          >
            {link.label}
            {link.badge && (
              <span className={`px-1 py-0.5 rounded text-[10px] font-semibold ${link.badgeColor ?? 'bg-slate-100 text-slate-600'}`}>
                {link.badge}
              </span>
            )}
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
