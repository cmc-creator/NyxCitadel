'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  AlertTriangle,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

export type TaskUrgency = 'overdue' | 'today' | 'week';

export interface DailyTask {
  id: string;
  type: string;
  label: string;         // e.g. "POC", "Grievance", "Policy"
  title: string;         // e.g. "POC-2026-003: Desert Haven"
  subtitle: string;      // e.g. "Response due · CMS 10-business-day window"
  dueDate: string;       // ISO string
  urgency: TaskUrgency;
  href: string;
  regulatoryNote?: string;
}

const TYPE_COLORS: Record<string, string> = {
  POC:          'bg-purple-900/40 text-purple-300 border-purple-700/40',
  QOC:          'bg-blue-900/40 text-blue-300 border-blue-700/40',
  GRIEVANCE:    'bg-orange-900/40 text-orange-300 border-orange-700/40',
  CAP:          'bg-rose-900/40 text-rose-300 border-rose-700/40',
  POLICY:       'bg-teal-900/40 text-teal-300 border-teal-700/40',
  RESPONSE:     'bg-violet-900/40 text-violet-300 border-violet-700/40',
  CALENDAR:     'bg-sky-900/40 text-sky-300 border-sky-700/40',
  ADHS:         'bg-red-900/40 text-red-300 border-red-700/40',
  QAPI:         'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  OTHER:        'bg-slate-800 text-slate-300 border-slate-600/40',
};

const URGENCY_CONFIG = {
  overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    headerBg: 'bg-red-950/50 border-red-800/40',
    headerText: 'text-red-300',
    iconColor: 'text-red-400',
    dotColor: 'bg-red-500',
    badgeBg: 'bg-red-900/50 text-red-300 border-red-700/40',
    rowHover: 'hover:bg-red-950/20',
  },
  today: {
    label: 'Due Today',
    icon: Clock,
    headerBg: 'bg-amber-950/50 border-amber-800/40',
    headerText: 'text-amber-300',
    iconColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-900/50 text-amber-300 border-amber-700/40',
    rowHover: 'hover:bg-amber-950/20',
  },
  week: {
    label: 'This Week',
    icon: CalendarDays,
    headerBg: 'bg-teal-950/40 border-teal-800/30',
    headerText: 'text-teal-300',
    iconColor: 'text-teal-400',
    dotColor: 'bg-teal-400',
    badgeBg: 'bg-teal-900/40 text-teal-300 border-teal-700/30',
    rowHover: 'hover:bg-teal-950/20',
  },
};

function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function loadChecked(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('nyx-my-day-checked');
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; ids: string[] };
    if (parsed.date !== getTodayKey()) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveChecked(ids: Set<string>): void {
  localStorage.setItem('nyx-my-day-checked', JSON.stringify({ date: getTodayKey(), ids: [...ids] }));
}

function TaskRow({
  task,
  checked,
  onToggle,
}: {
  task: DailyTask;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  const cfg = URGENCY_CONFIG[task.urgency];
  const typeColor = TYPE_COLORS[task.type] ?? TYPE_COLORS.OTHER;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-border/20 last:border-0 transition-colors ${cfg.rowHover} ${checked ? 'opacity-40' : ''}`}>
      {/* Check button */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 mt-0.5 text-muted-foreground/50 hover:text-teal-400 transition-colors"
        title={checked ? 'Mark as pending' : 'Mark as handled'}
      >
        {checked
          ? <CheckCircle2 className="w-5 h-5 text-teal-500" />
          : <Circle className="w-5 h-5" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${typeColor}`}>
            {task.label}
          </span>
          <p className={`text-sm font-medium text-foreground/90 truncate ${checked ? 'line-through' : ''}`}>
            {task.title}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{task.subtitle}</p>
        {task.regulatoryNote && (
          <p className="text-xs text-muted-foreground/50 mt-0.5">{task.regulatoryNote}</p>
        )}
      </div>

      {/* Due date + link */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded border ${cfg.badgeBg}`}>
          {task.urgency === 'overdue'
            ? `${format(new Date(task.dueDate), 'MMM d')}`
            : task.urgency === 'today'
            ? 'Today'
            : format(new Date(task.dueDate), 'EEE MMM d')}
        </span>
        <Link
          href={task.href}
          className="flex-shrink-0 p-1.5 rounded-lg bg-muted/30 hover:bg-teal-900/40 text-muted-foreground hover:text-teal-300 transition-colors"
          title="Open record"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TaskGroup({
  urgency,
  tasks,
  checked,
  onToggle,
  defaultOpen,
}: {
  urgency: TaskUrgency;
  tasks: DailyTask[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = URGENCY_CONFIG[urgency];
  const Icon = cfg.icon;
  const uncheckedCount = tasks.filter(t => !checked.has(t.id)).length;

  if (tasks.length === 0) return null;

  return (
    <div className={`rounded-xl border overflow-hidden ${cfg.headerBg}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotColor}`} />
        <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} />
        <span className={`text-sm font-semibold ${cfg.headerText}`}>{cfg.label}</span>
        <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}>
          {uncheckedCount} remaining · {tasks.length} total
        </span>
        <span className="ml-auto">
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </span>
      </button>
      {open && (
        <div className="bg-card/70 divide-y divide-border/20">
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} checked={checked.has(task.id)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DailyChecklistClient({ tasks }: { tasks: DailyTask[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecked(loadChecked());
    setMounted(true);
  }, []);

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }

  const overdue = tasks.filter(t => t.urgency === 'overdue');
  const today   = tasks.filter(t => t.urgency === 'today');
  const week    = tasks.filter(t => t.urgency === 'week');

  const totalUnchecked = tasks.filter(t => !checked.has(t.id)).length;
  const totalHandled   = tasks.filter(t => checked.has(t.id)).length;

  if (!mounted) {
    // Skeleton placeholder while localStorage loads
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-muted/30 rounded-xl" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-teal-500 mb-4" />
        <p className="text-xl font-semibold text-foreground/80">All clear for today!</p>
        <p className="text-sm text-muted-foreground mt-1">No overdue items or tasks due this week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground/80">
              {totalHandled === tasks.length
                ? '🎉 Everything handled!'
                : `${totalUnchecked} task${totalUnchecked !== 1 ? 's' : ''} remaining`}
            </span>
            <span className="text-xs text-muted-foreground">{totalHandled}/{tasks.length} handled</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${totalHandled === tasks.length ? 'bg-teal-500' : 'bg-teal-600'}`}
              style={{ width: tasks.length > 0 ? `${Math.round((totalHandled / tasks.length) * 100)}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Check off items as you action them — resets at midnight
          </p>
        </div>
      )}

      <TaskGroup urgency="overdue" tasks={overdue} checked={checked} onToggle={toggle} defaultOpen={true} />
      <TaskGroup urgency="today"   tasks={today}   checked={checked} onToggle={toggle} defaultOpen={true} />
      <TaskGroup urgency="week"    tasks={week}    checked={checked} onToggle={toggle} defaultOpen={true} />
    </div>
  );
}
