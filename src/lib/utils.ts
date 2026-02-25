import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Human-friendly date display */
export function formatDate(date: Date | string | null, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

/** How long ago or until a date */
export function fromNow(date: Date | string | null): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Returns compliance urgency color class based on due date */
export function getDueDateStatus(date: Date | string | null): {
  label: string;
  className: string;
  colorClass: string;
} {
  if (!date) return { label: 'No date', className: 'status-na', colorClass: 'text-gray-500' };
  const d = new Date(date);
  const now = new Date();
  if (isPast(d)) {
    return { label: 'Overdue', className: 'status-overdue', colorClass: 'text-red-600' };
  }
  if (isWithinInterval(d, { start: now, end: addDays(now, 14) })) {
    return { label: 'Due Soon', className: 'status-warning', colorClass: 'text-yellow-600' };
  }
  if (isWithinInterval(d, { start: now, end: addDays(now, 30) })) {
    return { label: 'Upcoming', className: 'status-upcoming', colorClass: 'text-blue-600' };
  }
  return { label: 'Scheduled', className: 'status-compliant', colorClass: 'text-green-600' };
}

/** Color for event categories */
export const CATEGORY_COLORS: Record<string, string> = {
  EM_COMMITTEE_MEETING: '#7c3aed',
  HVA_ASSESSMENT: '#b45309',
  TABLETOP_EXERCISE: '#0369a1',
  FUNCTIONAL_DRILL: '#0369a1',
  FULL_SCALE_DRILL: '#0369a1',
  EM_PLAN_REVIEW: '#6d28d9',
  FIRE_EVACUATION: '#dc2626',
  JC_MOCK_SURVEY: '#1d4ed8',
  JC_PI_MEETING: '#0891b2',
  AZ_LICENSE_RENEWAL: '#b91c1c',
  FIRE_ALARM_TEST: '#dc2626',
  GENERATOR_TEST: '#d97706',
  POLICY_REVIEW: '#059669',
  MANDATORY_EDUCATION: '#0ea5e9',
  DEFAULT: '#6b7280',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.DEFAULT;
}

/** Format incident number */
export function generateIncidentNumber(prefix = 'INC'): string {
  const date = format(new Date(), 'yyyyMMdd');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${date}-${rand}`;
}

/** Generate CAP number */
export function generateCapNumber(): string {
  const date = format(new Date(), 'yyyyMMdd');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CAP-${date}-${rand}`;
}

/** Truncate text */
export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}

/** Priority to color */
export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#6b7280',
};

export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.MEDIUM;
}
