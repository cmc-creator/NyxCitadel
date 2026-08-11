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
  BarChart3,
  CreditCard,
  UserCircle,
  Flame,
  Building2,
  Upload,
} from 'lucide-react';
import { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string;
  badgeColor?: string;
  tourId?: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

// ─────────────────────────────────────────────────────────────────
// Navigation - 8 logical sections, workflow-first organization
// ─────────────────────────────────────────────────────────────────
const navSections: NavSection[] = [

  // ── Core (no section label) ───────────────────────────────────
  {
    items: [
      { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, tourId: 'dashboard' },
      { href: '/assistant', label: 'Sentry AI',  icon: Sparkles, badge: 'AI', badgeColor: 'bg-teal-100 text-teal-700', tourId: 'sentry' },
    ],
  },

  // ── Daily Work ────────────────────────────────────────────────
  {
    label: 'DAILY WORK',
    items: [
      {
        href: '/trackers',
        label: 'Risk & Incidents',
        icon: ShieldAlert,
        tourId: 'incidents',
        children: [
          { href: '/trackers/incidents',        label: 'Incidents',               icon: AlertTriangle },
          { href: '/trackers/ir-iad',           label: 'IR / IAD Reports',        icon: FileWarning, badge: 'ADHS', badgeColor: 'bg-red-100 text-red-700' },
          { href: '/trackers/caps',             label: 'Corrective Action Plans', icon: ClipboardList },
          { href: '/trackers/rca',              label: 'Root Cause Analyses',     icon: Search },
          { href: '/trackers/risk-assessments', label: 'Risk Assessments',        icon: ShieldAlert },
        ],
      },
      {
        href: '/quality',
        label: 'Quality & QAPI',
        icon: Activity,
        children: [
          { href: '/quality',                    label: 'QAPI Dashboard',        icon: BarChart2 },
          { href: '/quality/metrics',            label: 'Quality Metrics',       icon: Activity },
          { href: '/quality/projects',           label: 'QAPI Projects',         icon: Target },
          { href: '/quality/poc',                label: 'Plans of Correction',   icon: ClipboardCheck },
          { href: '/trackers/grievances',        label: 'Patient Grievances',    icon: MessageSquareWarning, badge: 'CMS', badgeColor: 'bg-orange-100 text-orange-700' },
          { href: '/trackers/qoc',               label: 'QOC / LOI Complaints',  icon: Scale,               badge: 'CMS', badgeColor: 'bg-teal-100 text-teal-700' },
          { href: '/quality/response-templates', label: 'Response Templates',    icon: FileText },
          { href: '/quality/responses',          label: 'Generated Responses',   icon: Mail },
        ],
      },
    ],
  },

  // ── Regulatory ────────────────────────────────────────────────
  {
    label: 'REGULATORY',
    items: [
      { href: '/calendar',            label: 'Compliance Calendar',    icon: CalendarDays, tourId: 'calendar' },
      {
        href: '/trackers/policies',
        label: 'Policies & Procedures',
        icon: FileText,
        children: [
          { href: '/trackers/policies',             label: 'Policy List',        icon: FileText },
          { href: '/trackers/policies/bulk-upload', label: 'Bulk Upload',        icon: Upload },
          { href: '/trackers/policies/coverage',    label: 'Coverage Matrix',    icon: BarChart2 },
        ],
      },
      { href: '/trackers/compliance', label: 'Compliance Items',       icon: ShieldCheck },
      {
        href: '/surveys',
        label: 'Surveys & Inspections',
        icon: FileSearch,
        tourId: 'surveys',
        children: [
          { href: '/surveys',      label: 'All Surveys',  icon: FileSearch },
          { href: '/surveys/mock', label: 'Mock Surveys', icon: ClipboardCheck, badge: 'JC', badgeColor: 'bg-teal-100 text-teal-700' },
          { href: '/surveys/new',  label: 'Log Survey',   icon: FileText },
        ],
      },
      {
        href: '/reporting',
        label: 'Regulatory Reporting',
        icon: BarChart3,
        badge: 'CMS/JC',
        badgeColor: 'bg-blue-100 text-blue-700',
        children: [
          { href: '/reporting',             label: 'Reporting Dashboard', icon: BarChart3 },
          { href: '/reporting/oryx',        label: 'HBIPS / ORYX',        icon: BarChart3,     badge: 'JC',   badgeColor: 'bg-teal-100 text-teal-700' },
          { href: '/reporting/nhsn',        label: 'NHSN HAI',            icon: ShieldAlert,   badge: 'CDC',  badgeColor: 'bg-blue-100 text-blue-700' },
          { href: '/reporting/adhs',        label: 'ADHS IR/IAD',         icon: FileWarning,   badge: 'ADHS', badgeColor: 'bg-orange-100 text-orange-700' },
          { href: '/reporting/jc-sentinel', label: 'JC Sentinel Event',   icon: AlertTriangle, badge: 'JC',   badgeColor: 'bg-red-100 text-red-700' },
          { href: '/reporting/hcahps',      label: 'CMS HCAHPS',          icon: BarChart3,     badge: 'CMS',  badgeColor: 'bg-violet-100 text-violet-700' },
          { href: '/reporting/cop',         label: 'CMS CoP',             icon: ShieldAlert,   badge: 'CMS',  badgeColor: 'bg-indigo-100 text-indigo-700' },
        ],
      },
    ],
  },

  // ── Clinical ──────────────────────────────────────────────────
  {
    label: 'CLINICAL',
    items: [
      {
        href: '/infection-control',
        label: 'Infection Control',
        icon: Biohazard,
        badge: 'IC',
        badgeColor: 'bg-teal-100 text-teal-700',
        tourId: 'infection-control',
        children: [
          { href: '/infection-control/icra',        label: 'ICRA Assessments', icon: TestTube2 },
          { href: '/infection-control/hai',          label: 'HAI Surveillance', icon: Biohazard },
          { href: '/infection-control/outbreaks',    label: 'Outbreak Tracking',icon: AlertTriangle },
          { href: '/infection-control/hand-hygiene', label: 'Hand Hygiene',     icon: ShieldCheck },
        ],
      },
      { href: '/restraint-seclusion', label: 'Restraint & Seclusion', icon: ShieldOff, badge: 'CMS', badgeColor: 'bg-red-100 text-red-700' },
      {
        href: '/hipaa',
        label: 'HIPAA / Privacy',
        icon: Lock,
        badge: 'HIPAA',
        badgeColor: 'bg-blue-100 text-blue-700',
        children: [
          { href: '/hipaa/breaches', label: 'Breach Log',  icon: AlertTriangle },
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
          { href: '/patient-rights/consents',           label: 'Consent Records',    icon: FileText },
          { href: '/patient-rights/advance-directives', label: 'Advance Directives', icon: ClipboardCheck },
          { href: '/patient-rights/holds',              label: 'Involuntary Holds',  icon: ShieldOff, badge: 'Title 36', badgeColor: 'bg-red-100 text-red-700' },
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
      { href: '/treatment-plans',    label: 'Treatment Planning',  icon: ClipboardList, badge: 'ADHS', badgeColor: 'bg-teal-100 text-teal-700' },
      { href: '/discharge-planning', label: 'Discharge Planning',  icon: Truck,         badge: 'CMS',  badgeColor: 'bg-sky-100 text-sky-700' },
    ],
  },

  // ── Environment & Safety ──────────────────────────────────────
  {
    label: 'ENVIRONMENT & SAFETY',
    items: [
      {
        href: '/eoc',
        label: 'Environment of Care',
        icon: HardHat,
        badge: 'EOC',
        badgeColor: 'bg-amber-100 text-amber-700',
        tourId: 'eoc',
        children: [
          { href: '/eoc/ligature',     label: 'Ligature Risk',  icon: CircleAlert,  badge: 'TJC', badgeColor: 'bg-amber-100 text-amber-700' },
          { href: '/eoc/rounds',       label: 'Safety Rounds',  icon: ClipboardList },
          { href: '/eoc/deficiencies', label: 'Deficiencies',   icon: AlertTriangle },
          { href: '/eoc/equipment',    label: 'Equipment PM',   icon: Wrench },
        ],
      },
      {
        href: '/fire-safety',
        label: 'Fire Safety & Preparedness',
        icon: Flame,
        badge: 'NFPA',
        badgeColor: 'bg-red-100 text-red-700',
      },
      {
        href: '/emergency',
        label: 'Emergency Management',
        icon: Siren,
        children: [
          { href: '/emergency/hva',    label: 'HVA Assessment',    icon: ShieldAlert },
          { href: '/emergency/drills', label: 'Drills & Exercises', icon: Siren },
          { href: '/emergency/plans',  label: 'EM Plans',           icon: BookOpen },
          { href: '/emergency/map',    label: 'Facility Map',       icon: Map, badge: 'TWIN', badgeColor: 'bg-sky-100 text-sky-700' },
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
    ],
  },

  // ── People ────────────────────────────────────────────────────
  {
    label: 'PEOPLE',
    items: [
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
        href: '/trackers/training',
        label: 'Training & Competency',
        icon: GraduationCap,
        tourId: 'training',
        children: [
          { href: '/education/training',           label: 'My Training',            icon: UserCheck },
          { href: '/trackers/training/compliance', label: 'Compliance Gatekeeper',  icon: ShieldAlert },
          { href: '/trackers/training/matrix',     label: 'Training Matrix',        icon: GraduationCap },
        ],
      },
      {
        href: '/governance',
        label: 'Governance',
        icon: Building2,
        children: [
          { href: '/governance/committees', label: 'Committees',      icon: Users2 },
          { href: '/governance/documents',  label: 'Governance Docs', icon: FileText },
        ],
      },
    ],
  },

  // ── Intelligence ──────────────────────────────────────────────
  {
    label: 'INTELLIGENCE',
    items: [
      {
        href: '/intelligence',
        label: 'Analytics & Reports',
        icon: BarChart2,
        children: [
          { href: '/resilience',            label: 'Resilience Scorecard',  icon: ResilienceIcon },
          { href: '/dashboard/departments', label: 'Department Scorecards', icon: Users2 },
          { href: '/board-report',          label: 'Board Report',          icon: FileBarChart, badge: 'EXEC', badgeColor: 'bg-emerald-100 text-emerald-700', tourId: 'board-report' },
          { href: '/outpatient-iop', label: 'Outpatient / IOP',     icon: HeartHandshake, badge: 'IOP', badgeColor: 'bg-emerald-100 text-emerald-700' },
        ],
      },
      { href: '/regulatory-updates', label: 'Regulatory Updates', icon: Newspaper, badge: 'NEW', badgeColor: 'bg-teal-100 text-teal-700' },
    ],
  },

  // ── Resources ─────────────────────────────────────────────────
  {
    label: 'RESOURCES',
    items: [
      { href: '/resources/standards', label: 'Standards Library',  icon: BookOpen, badge: 'REF', badgeColor: 'bg-blue-100 text-blue-700' },
      { href: '/compliance-library',  label: 'Regulatory Library', icon: Library,  badge: 'REF', badgeColor: 'bg-slate-100 text-slate-600' },
      { href: '/site-search',         label: 'Search',             icon: Search },
      { href: '/documents',           label: 'Documents',          icon: FileText },
      { href: '/archives',            label: 'Compliance Archive', icon: Archive },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { href: '/admin',            label: 'Admin Panel',         icon: ShieldCheck },
  { href: '/admin/pilot-kpis', label: 'Pilot KPIs',          icon: BarChart2 },
  { href: '/export',           label: 'Export Center',       icon: Download },
  { href: '/guide',            label: 'User Guide',          icon: BookOpen },
  { href: '/walkthrough',      label: 'Feature Walkthrough', icon: PlayCircle },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    tourId: 'settings',
    children: [
      { href: '/settings/profile',       label: 'My Profile',        icon: UserCircle },
      { href: '/settings',               label: 'General Settings',  icon: Settings },
      { href: '/settings/security',      label: 'Security (2FA)',    icon: Lock },
      { href: '/settings/facility',      label: 'Facility Config',   icon: Building2 },
      { href: '/settings/users',         label: 'User Management',   icon: Users2 },
      { href: '/settings/notifications', label: 'Notifications',     icon: Mail },
      { href: '/settings/billing',       label: 'Billing',            icon: CreditCard },
      { href: '/settings/integrations',  label: 'Integrations',       icon: Wrench },
    ],
  },
];

const SidebarCloseContext = createContext<(() => void) | undefined>(undefined);

function NavLink({ item, depth = 0, isCollapsed = false }: { item: NavItem; depth?: number; isCollapsed?: boolean }) {
  const pathname = usePathname();
  const onClose  = useContext(SidebarCloseContext);
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
          data-tour={item.tourId}
          className={cn('sidebar-link w-full text-left', depth > 0 && 'pl-8', isActive && 'active', isCollapsed && depth === 0 && 'justify-center')}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="flex-1">{item.label}</span>}
          {item.badge && !isCollapsed && (
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full mr-1', item.badgeColor ?? 'bg-red-500 text-white')}>
              {item.badge}
            </span>
          )}
          {!isCollapsed && <ChevronDown className={cn('w-3.5 h-3.5 transition-transform flex-shrink-0', open && 'rotate-180')} />}
        </button>
        {open && !isCollapsed && (
          <div className="mt-0.5 space-y-0.5 pl-3">
            {item.children.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      data-tour={item.tourId}
      className={cn('sidebar-link', depth > 0 && 'pl-8', isActive && 'active', isCollapsed && depth === 0 && 'justify-center')}
      title={isCollapsed ? item.label : undefined}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className={cn('ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full', item.badgeColor ?? 'bg-red-500 text-white')}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: { isOpen?: boolean; onClose?: () => void; isCollapsed?: boolean; onToggleCollapse?: () => void }) {
  return (
    <SidebarCloseContext.Provider value={onClose}>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={cn(
        'sidebar min-h-screen flex flex-col fixed left-0 top-0 bottom-0 transition-all duration-300',
        'z-40 md:z-30',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCollapsed ? 'w-20 md:w-20' : 'w-64 md:w-64'
      )}>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 md:hidden"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Branding */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/8" style={{background: 'linear-gradient(135deg, hsl(228 45% 5%) 0%, hsl(228 42% 7%) 100%)'}}>
          <Link href="/dashboard" className={cn('flex items-center gap-3 group', isCollapsed && 'hidden md:flex')}>
            <Image
              src="/citadellogo-clean.png"
              alt="NyxCitadel"
              width={36}
              height={36}
              unoptimized
              priority
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/logo-white.svg')) img.src = '/logo-white.svg';
              }}
              className="h-9 w-9 flex-shrink-0 drop-shadow-lg group-hover:drop-shadow-[0_0_8px_rgba(14,165,160,0.6)] transition-all duration-300"
            />
            <div>
              <p className="font-bold text-sm tracking-wide text-white leading-tight">
                NyxCitadel<sup className="text-[9px] font-normal align-super ml-0.5 opacity-70">&#x2122;</sup>
              </p>
              <p className="text-[10px] leading-tight" style={{color: 'hsl(43 65% 54%)'}}>Compliance Intelligence</p>
            </div>
          </Link>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', isCollapsed ? '-rotate-90' : 'rotate-90')} />
          </button>
        </div>

        {/* Main Nav */}
        <nav className={cn('flex-1 overflow-y-auto space-y-4', isCollapsed ? 'px-1.5 py-3' : 'px-3 py-3')}>
          {navSections.map((section, idx) => (
            <div key={idx}>
              {section.label && !isCollapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25 select-none">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="border-t border-white/10 px-1.5 md:px-1.5 py-3 space-y-0.5" style={{background: 'linear-gradient(135deg, hsl(228 35% 10%) 0%, hsl(228 32% 12%) 100%)'}}>
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
          <button
            onClick={() => { onClose?.(); signOut({ callbackUrl: '/login' }); }}
            className={cn('sidebar-link w-full text-left text-red-400 hover:text-red-300', isCollapsed && 'justify-center')}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </SidebarCloseContext.Provider>
  );
}
