'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  ShieldAlert,
  FileText,
  GraduationCap,
  Siren,
  BookOpen,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  ChevronDown,
  Building2,
  Activity,
  BarChart2,
  Target,
  MessageSquareWarning,
  ClipboardCheck,
  Search,
  Mail,
  Scale,
  FileWarning,
  Archive,
  Map,
  FileBarChart,
  ShieldCheck as ResilienceIcon,
  Sparkles,
  HardHat,
  CircleAlert,
  Wrench,
  ShieldOff,
  Biohazard,
  UserCheck,
  Lock,
  HeartHandshake,
  Pill,
  Users2,
  Truck,
  TestTube2,
  Library,
  Newspaper,
  PlayCircle,
  Download,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/assistant',
    label: 'Sentry Assistant 🤖',
    icon: Sparkles,
    badge: 'AI',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    href: '/site-search',
    label: 'Search',
    icon: Search,
  },
  {
    href: '/calendar',
    label: 'Compliance Calendar',
    icon: CalendarDays,
  },
  {
    href: '/compliance-library',
    label: 'Reg. Library',
    icon: Library,
    badge: 'REF',
    badgeColor: 'bg-slate-100 text-slate-600',
  },
  {
    href: '/trackers',
    label: 'Trackers',
    icon: ClipboardList,
    children: [
      { href: '/trackers/compliance', label: 'Compliance Items', icon: ShieldCheck },
      { href: '/trackers/policies', label: 'Policies & Procedures', icon: FileText },
      { href: '/trackers/training', label: 'Training & Competency', icon: GraduationCap },
      { href: '/trackers/incidents', label: 'Incidents / Occurrences', icon: AlertTriangle },
      { href: '/trackers/caps', label: 'Corrective Action Plans', icon: ClipboardList },
      { href: '/trackers/risk-assessments', label: 'Risk Assessments', icon: ShieldAlert },
      { href: '/trackers/grievances', label: 'Patient Grievances', icon: MessageSquareWarning, badge: 'CMS', badgeColor: 'bg-orange-100 text-orange-700' },
      { href: '/trackers/qoc', label: 'QOC / LOI Complaints', icon: Scale, badge: 'CMS', badgeColor: 'bg-teal-100 text-teal-700' },
      { href: '/trackers/ir-iad', label: 'IR / IAD Incidents', icon: FileWarning, badge: 'ADHS', badgeColor: 'bg-red-100 text-red-700' },
      { href: '/trackers/rca', label: 'Root Cause Analyses', icon: Search },
    ],
  },
  {
    href: '/quality',
    label: 'Quality / QAPI',
    icon: Activity,
    children: [
      { href: '/quality', label: 'QAPI Dashboard', icon: BarChart2 },
      { href: '/quality/metrics', label: 'Quality Metrics', icon: Activity },
      { href: '/quality/projects', label: 'QAPI Projects', icon: Target },
      { href: '/quality/response-templates', label: 'Response Templates', icon: FileText },
      { href: '/quality/responses', label: 'Generated Responses', icon: Mail },
      { href: '/quality/poc', label: 'Plans of Correction', icon: ClipboardCheck },
    ],
  },
  {
    href: '/emergency',
    label: 'Emergency Management',
    icon: Siren,
    children: [
      { href: '/emergency/hva',   label: 'HVA Assessment',   icon: ShieldAlert },
      { href: '/emergency/drills', label: 'Drills & Exercises', icon: Siren },
      { href: '/emergency/plans',  label: 'EM Plans',           icon: BookOpen },
      { href: '/emergency/map',    label: 'Facility Map',       icon: Map,   badge: 'TWIN', badgeColor: 'bg-sky-100 text-sky-700' },
    ],
  },
  {
    href: '/eoc',
    label: 'Environment of Care',
    icon: HardHat,
    badge: 'EOC',
    badgeColor: 'bg-amber-100 text-amber-700',
    children: [
      { href: '/eoc/ligature',    label: 'Ligature Risk',    icon: CircleAlert,  badge: 'TJC', badgeColor: 'bg-amber-100 text-amber-700' },
      { href: '/eoc/rounds',      label: 'Safety Rounds',   icon: ClipboardList },
      { href: '/eoc/deficiencies',label: 'Deficiencies',    icon: AlertTriangle },
      { href: '/eoc/equipment',   label: 'Equipment PM',    icon: Wrench },
    ],
  },
  // ── Regulatory Compliance Modules ────────────────────────────
  {
    href: '/restraint-seclusion',
    label: 'Restraint & Seclusion',
    icon: ShieldOff,
    badge: 'CMS',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    href: '/infection-control',
    label: 'Infection Control',
    icon: Biohazard,
    badge: 'IC',
    badgeColor: 'bg-teal-100 text-teal-700',
    children: [
      { href: '/infection-control/icra',          label: 'ICRA Assessments', icon: TestTube2 },
      { href: '/infection-control/hai',            label: 'HAI Surveillance',  icon: Biohazard },
      { href: '/infection-control/outbreaks',      label: 'Outbreak Tracking', icon: AlertTriangle },
      { href: '/infection-control/hand-hygiene',   label: 'Hand Hygiene',      icon: ShieldCheck },
    ],
  },
  {
    href: '/credentialing',
    label: 'Credentialing',
    icon: UserCheck,
    badge: 'TJC',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    children: [
      { href: '/credentialing/providers', label: 'Provider Directory', icon: UserCheck },
      { href: '/credentialing/licenses',  label: 'License Tracker',    icon: FileText },
      { href: '/credentialing/oppe',      label: 'OPPE / FPPE',        icon: ClipboardCheck },
    ],
  },
  {
    href: '/treatment-plans',
    label: 'Treatment Planning',
    icon: ClipboardList,
    badge: 'ADHS',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    href: '/hipaa',
    label: 'HIPAA / Privacy',
    icon: Lock,
    badge: 'HIPAA',
    badgeColor: 'bg-blue-100 text-blue-700',
    children: [
      { href: '/hipaa/breaches', label: 'Breach Log', icon: AlertTriangle },
      { href: '/hipaa/baa',      label: 'BAA Tracker', icon: FileText },
    ],
  },
  {
    href: '/patient-rights',
    label: 'Patient Rights',
    icon: HeartHandshake,
    badge: 'CMS',
    badgeColor: 'bg-rose-100 text-rose-700',
    children: [
      { href: '/patient-rights/consents',             label: 'Consent Records',     icon: FileText },
      { href: '/patient-rights/advance-directives',   label: 'Advance Directives',  icon: ClipboardCheck },
      { href: '/patient-rights/holds',                label: 'Involuntary Holds',   icon: ShieldOff, badge: 'Title 36', badgeColor: 'bg-red-100 text-red-700' },
    ],
  },
  {
    href: '/pharmacy',
    label: 'Pharmacy / Meds',
    icon: Pill,
    children: [
      { href: '/pharmacy/controlled-substances', label: 'Controlled Substances', icon: ClipboardList },
      { href: '/pharmacy/high-alert',            label: 'High-Alert Meds',       icon: AlertTriangle },
      { href: '/pharmacy/pdmp',                  label: 'PDMP Check Log',        icon: Search },
    ],
  },
  {
    href: '/governance',
    label: 'Governance',
    icon: Building2,
    children: [
      { href: '/governance/committees', label: 'Committees',          icon: Users2 },
      { href: '/governance/documents',  label: 'Governance Docs',     icon: FileText },
    ],
  },
  {
    href: '/workforce-health',
    label: 'Workforce Health',
    icon: Users2,
    children: [
      { href: '/workforce-health/employee-health', label: 'Employee Health', icon: HeartHandshake },
      { href: '/workforce-health/osha',            label: 'OSHA 300 Log',    icon: HardHat },
    ],
  },
  {
    href: '/discharge-planning',
    label: 'Discharge Planning',
    icon: Truck,
    badge: 'CMS',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  // ─────────────────────────────────────────────────────────────
  {
    href: '/surveys',
    label: 'Surveys & Inspections',
    icon: FileSearch,
  },
  {
    href: '/archives',
    label: 'Compliance Archive',
    icon: Archive,
  },
  {
    href: '/intelligence',
    label: 'Intelligence',
    icon: BarChart2,
    children: [
      { href: '/resilience',          label: 'Resilience Scorecard', icon: ResilienceIcon },
      { href: '/board-report',        label: 'Board Report',         icon: FileBarChart, badge: 'EXEC', badgeColor: 'bg-emerald-100 text-emerald-700' },
      { href: '/regulatory-updates',  label: 'Regulatory Updates',   icon: Newspaper,    badge: 'NEW',  badgeColor: 'bg-teal-100 text-teal-700' },
      { href: '/outpatient-iop',      label: 'Outpatient / IOP',      icon: HeartHandshake, badge: 'IOP', badgeColor: 'bg-emerald-100 text-emerald-700' },
    ],
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: FileText,
  },
];

const bottomNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck },
  { href: '/admin/pilot-kpis', label: 'Pilot KPIs', icon: BarChart2 },
  { href: '/export', label: 'Export Center', icon: Download },
  { href: '/guide', label: 'User Guide', icon: BookOpen },
  { href: '/walkthrough', label: 'Feature Walkthrough', icon: PlayCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/settings/facility', label: 'Facility Config', icon: Building2 },
];

function NavLink({
  item,
  depth = 0,
}: {
  item: NavItem;
  depth?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  );

  const isActive =
    depth === 0
      ? pathname === item.href ||
        (item.children
          ? item.children.some((c) => pathname.startsWith(c.href))
          : pathname.startsWith(item.href))
      : pathname === item.href || pathname.startsWith(item.href + '/');

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'sidebar-link w-full text-left',
            depth > 0 && 'pl-8',
            isActive && 'active'
          )}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'sidebar-link',
        depth > 0 && 'pl-8',
        isActive && 'active'
      )}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            'ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full',
            item.badgeColor ?? 'bg-red-500 text-white'
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar w-64 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Branding */}
      <div className="flex items-center px-4 py-4 border-b border-white/8" style={{background: 'linear-gradient(135deg, hsl(228 45% 5%) 0%, hsl(228 42% 7%) 100%)'}}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Image
            src="/citadellogo.png"
            alt="NyxCitadel"
            width={36}
            height={36}
            priority
            className="h-9 w-9 flex-shrink-0 drop-shadow-lg group-hover:drop-shadow-[0_0_8px_rgba(14,165,160,0.6)] transition-all duration-300"
          />
          <div>
            <p className="font-bold text-sm tracking-wide text-white leading-tight">NyxCitadel<sup className="text-[9px] font-normal align-super ml-0.5 opacity-70">™</sup></p>
            <p className="text-[10px] leading-tight" style={{color: 'hsl(43 65% 54%)'}}>Compliance Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-link w-full text-left text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
