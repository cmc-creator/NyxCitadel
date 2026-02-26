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
    href: '/calendar',
    label: 'Compliance Calendar',
    icon: CalendarDays,
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
      { href: '/emergency/hva', label: 'HVA Assessment', icon: ShieldAlert },
      { href: '/emergency/drills', label: 'Drills & Exercises', icon: Siren },
      { href: '/emergency/plans', label: 'EM Plans', icon: BookOpen },
    ],
  },
  {
    href: '/surveys',
    label: 'Surveys & Inspections',
    icon: FileSearch,
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: FileText,
  },
];

const bottomNavItems: NavItem[] = [
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
      ? pathname === item.href || (item.children && pathname.startsWith(item.href))
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
      <div className="flex items-center px-4 py-4 border-b border-white/10">
        <Link href="/dashboard" className="block">
          <Image
            src="/logo-white.svg"
            alt="Destiny Springs Healthcare"
            width={200}
            height={44}
            priority
            className="h-11 w-auto"
          />
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
