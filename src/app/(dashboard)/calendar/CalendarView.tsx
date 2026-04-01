'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays,
  CheckCircle2, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth,
  addMonths, subMonths, addWeeks, subWeeks,
  isToday, isPast, parseISO,
} from 'date-fns';

type EventStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAIVED' | 'NA';
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ViewMode = 'month' | 'week' | 'list';
type QuickFilter = 'all' | 'overdue' | '30days' | '90days' | 'em' | 'jc' | 'az' | 'cms';

export interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  completedDate: string | null;
  category: string;
  regulatoryBody: string | null;
  priority: Priority;
  status: EventStatus;
  notes: string | null;
  documentUrl: string | null;
}

const PRIORITY_CHIP: Record<Priority, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH:     'bg-orange-500 text-white',
  MEDIUM:   'bg-teal-500 text-white',
  LOW:      'bg-slate-400 text-white',
};

const PRIORITY_BAR: Record<Priority, string> = {
  CRITICAL: 'bg-red-600',
  HIGH:     'bg-orange-400',
  MEDIUM:   'bg-teal-500',
  LOW:      'bg-slate-300',
};

function fmtCat(c: string) {
  return c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function StatusIcon({ status }: { status: EventStatus }) {
  if (status === 'COMPLETED') return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
  if (status === 'OVERDUE') return <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
  return <Clock className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />;
}

export default function CalendarView({ initialEvents }: { initialEvents: CalEvent[] }) {
  const router = useRouter();
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [view, setView]     = useState<ViewMode>('month');
  const [current, setCurrent] = useState(new Date());
  const [filter, setFilter] = useState<QuickFilter>('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  // ── Filter events ─────────────────────────────────────────────────────
  const filtered = events.filter(ev => {
    const due = parseISO(ev.dueDate);
    const now = new Date();
    if (filter === 'overdue') return isPast(due) && ev.status !== 'COMPLETED';
    if (filter === '30days') {
      const d30 = new Date(); d30.setDate(d30.getDate() + 30);
      return due >= now && due <= d30 && !['COMPLETED','NA','WAIVED'].includes(ev.status);
    }
    if (filter === '90days') {
      const d90 = new Date(); d90.setDate(d90.getDate() + 90);
      return due >= now && due <= d90 && !['COMPLETED','NA','WAIVED'].includes(ev.status);
    }
    if (filter === 'em') return ev.category.startsWith('EM_') || ev.category.includes('DRILL') || ev.category.includes('TABLETOP') || ev.category.includes('FUNCTIONAL') || ev.category.includes('FULL_SCALE') || ev.category.includes('HVA') || ev.category.includes('AFTER_ACTION') || ev.category.includes('COMMUNITY_PARTNER');
    if (filter === 'jc') return ev.regulatoryBody === 'JOINT_COMMISSION';
    if (filter === 'az') return ev.regulatoryBody === 'AZ_ADHS';
    if (filter === 'cms') return ev.regulatoryBody === 'CMS';
    return true;
  });

  // ── Stats ─────────────────────────────────────────────────────────────
  const now = new Date();
  const d30 = new Date(); d30.setDate(d30.getDate() + 30);
  const stats = {
    overdue:   events.filter(e => isPast(parseISO(e.dueDate)) && e.status !== 'COMPLETED').length,
    due30:     events.filter(e => { const d=parseISO(e.dueDate); return d>=now&&d<=d30&&!['COMPLETED','NA','WAIVED'].includes(e.status); }).length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    total:     events.length,
  };

  // ── API helpers ───────────────────────────────────────────────────────
  const patchEventDate = useCallback(async (id: string, date: Date) => {
    const res = await fetch(`/api/calendar/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate: date.toISOString() }),
    });
    if (!res.ok) router.refresh();
  }, [router]);

  const markComplete = useCallback(async (id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, status: 'COMPLETED' as EventStatus, completedDate: new Date().toISOString() } : e
    ));
    await fetch(`/api/calendar/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', completedDate: new Date().toISOString() }),
    });
  }, []);

  // ── Drag & Drop ───────────────────────────────────────────────────────
  const handleDrop = useCallback((date: Date) => {
    if (!dragId) return;
    setEvents(prev => prev.map(e =>
      e.id === dragId ? { ...e, dueDate: date.toISOString() } : e
    ));
    patchEventDate(dragId, date);
    setDragId(null);
    setDragOverDay(null);
  }, [dragId, patchEventDate]);

  const eventsOnDay = (date: Date) =>
    filtered.filter(e => isSameDay(parseISO(e.dueDate), date));

  // ── Navigation ────────────────────────────────────────────────────────
  const prev = () => view === 'month' ? setCurrent(subMonths(current, 1)) : setCurrent(subWeeks(current, 1));
  const next = () => view === 'month' ? setCurrent(addMonths(current, 1)) : setCurrent(addWeeks(current, 1));

  const navLabel = () => {
    if (view === 'month') return format(current, 'MMMM yyyy');
    if (view === 'week') {
      const ws = startOfWeek(current, { weekStartsOn: 0 });
      const we = endOfWeek(current, { weekStartsOn: 0 });
      return `${format(ws,'MMM d')} \u2013 ${format(we,'MMM d, yyyy')}`;
    }
    return 'All Events';
  };

  // ── Month view ────────────────────────────────────────────────────────
  const renderMonth = () => {
    const monthStart = startOfMonth(current);
    const monthEnd   = endOfMonth(current);
    const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days       = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {days.map(day => {
              const dayEvents = eventsOnDay(day);
              const inMonth   = isSameMonth(day, current);
              const today     = isToday(day);
              const dayKey    = day.toISOString();
              const isDragOver = dragOverDay === dayKey;
              return (
                <div
                  key={dayKey}
                  onDragOver={e => { e.preventDefault(); setDragOverDay(dayKey); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => handleDrop(day)}
                  className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 relative group/cell transition-colors ${
                    !inMonth ? 'bg-slate-50/70' : ''
                  } ${isDragOver ? 'bg-teal-50 ring-2 ring-inset ring-teal-300' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      today ? 'bg-teal-600 text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <Link
                      href={`/calendar/new?date=${format(day,'yyyy-MM-dd')}`}
                      className="opacity-0 group-hover/cell:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-teal-100 text-teal-500 transition-all text-xs font-bold"
                      title={`Add event on ${format(day,'MMM d')}`}
                    >+</Link>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={e => { e.stopPropagation(); setDragId(ev.id); }}
                        onDragEnd={() => setDragId(null)}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded cursor-grab active:cursor-grabbing truncate transition-opacity ${
                          dragId === ev.id ? 'opacity-40' : ''
                        } ${
                          ev.status === 'COMPLETED'
                            ? 'line-through opacity-50 bg-slate-100 text-slate-400'
                            : PRIORITY_CHIP[ev.priority]
                        }`}
                        title={ev.title}
                      >
                        <Link href={`/calendar/${ev.id}/edit`} className="hover:underline block truncate" onClick={e => e.stopPropagation()}>
                          {ev.title}
                        </Link>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-medium px-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Week view ─────────────────────────────────────────────────────────
  const renderWeek = () => {
    const weekStart = startOfWeek(current, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }} className="grid grid-cols-7 divide-x divide-slate-100">
          {days.map(day => {
            const dayEvents = eventsOnDay(day);
            const today     = isToday(day);
            const dayKey    = day.toISOString();
            const isDragOver = dragOverDay === dayKey;
            return (
              <div
                key={dayKey}
                onDragOver={e => { e.preventDefault(); setDragOverDay(dayKey); }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={() => handleDrop(day)}
                className={`min-h-[360px] p-2 hover:bg-slate-50/50 group/cell transition-colors ${
                  isDragOver ? 'bg-teal-50 ring-2 ring-inset ring-teal-300' : ''
                }`}
              >
                {/* Column header */}
                <div className="text-center pb-2 mb-2 border-b border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    today ? 'bg-teal-600 text-white' : 'text-slate-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <Link
                    href={`/calendar/new?date=${format(day,'yyyy-MM-dd')}`}
                    className="opacity-0 group-hover/cell:opacity-100 text-[10px] text-teal-500 hover:text-teal-700 font-medium transition-all"
                  >+ add</Link>
                </div>
                <div className="space-y-1.5">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={e => { e.stopPropagation(); setDragId(ev.id); }}
                      onDragEnd={() => setDragId(null)}
                      className={`text-xs font-medium px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-opacity group/ev ${
                        dragId === ev.id ? 'opacity-40' : ''
                      } ${
                        ev.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : PRIORITY_CHIP[ev.priority]
                      }`}
                    >
                      <Link href={`/calendar/${ev.id}/edit`} className="block hover:underline truncate font-semibold" onClick={e => e.stopPropagation()}>
                        {ev.title}
                      </Link>
                      <div className="text-[10px] opacity-70 mt-0.5 truncate">{fmtCat(ev.category)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── List view ─────────────────────────────────────────────────────────
  const renderList = () => {
    const sorted = [...filtered].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const grouped: Record<string, CalEvent[]> = {};
    sorted.forEach(ev => {
      const key = format(parseISO(ev.dueDate), 'MMMM yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ev);
    });
    if (Object.keys(grouped).length === 0) return (
      <div className="p-16 text-center text-slate-400">
        <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
        <p className="font-medium">No events match this filter.</p>
        <p className="text-sm mt-1">
          <Link href="/calendar/new" className="text-teal-600 hover:underline">Add an event</Link>
          {' '}or try a different filter.
        </p>
      </div>
    );
    return (
      <div className="divide-y divide-slate-100">
        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <div className="bg-slate-50 px-5 py-2.5 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">{month}</h3>
              <span className="text-xs text-slate-400">{monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {monthEvents.map(ev => {
                const due     = parseISO(ev.dueDate);
                const overdue = isPast(due) && ev.status !== 'COMPLETED';
                return (
                  <div key={ev.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors group">
                    {/* Date bubble */}
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${
                      isToday(due)  ? 'bg-teal-600 border-teal-600 text-white' :
                      overdue       ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-teal-50 border-teal-100 text-teal-700'
                    }`}>
                      <span className="text-sm font-bold leading-none">{format(due,'d')}</span>
                      <span className="text-[10px] uppercase leading-none mt-0.5">{format(due,'MMM')}</span>
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <StatusIcon status={ev.status} />
                        <Link href={`/calendar/${ev.id}/edit`}
                          className="text-sm font-medium text-slate-800 hover:text-teal-700 truncate">
                          {ev.title}
                        </Link>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${PRIORITY_CHIP[ev.priority]}`}>
                          {ev.priority}
                        </span>
                        {overdue && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex-shrink-0">OVERDUE</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {fmtCat(ev.category)}{ev.regulatoryBody ? ` · ${ev.regulatoryBody.replace(/_/g,' ')}` : ''}
                      </div>
                    </div>
                    {/* Priority bar */}
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${PRIORITY_BAR[ev.priority]}`} />
                    {/* Actions */}
                    {ev.status !== 'COMPLETED' && (
                      <button
                        onClick={() => markComplete(ev.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-green-600 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-50 transition-all whitespace-nowrap font-medium"
                      >
                        ✓ Done
                      </button>
                    )}
                    <Link href={`/calendar/${ev.id}/edit`}
                      className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-all">
                      Edit
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FILTER_OPTS: { value: QuickFilter; label: string }[] = [
    { value: 'all',     label: 'All Events' },
    { value: 'overdue', label: '\uD83D\uDD34 Overdue' },
    { value: '30days',  label: '\u26A1 30 Days' },
    { value: '90days',  label: '\uD83D\uDCC5 90 Days' },
    { value: 'em',      label: '\uD83D\uDEA8 Emergency' },
    { value: 'jc',      label: '\uD83C\uDFE5 Joint Comm.' },
    { value: 'az',      label: '\uD83C\uDF35 AZ ADHS' },
    { value: 'cms',     label: '\uD83C\uDFDB\uFE0F CMS' },
  ];

  return (
    <div className="space-y-4">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-teal-600" />
            Compliance Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{events.length} events loaded</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Link href="/api/compliance/generate-calendar"
            className="inline-flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Auto-Generate {new Date().getFullYear() + 1}
          </Link>
          <Link href="/calendar/new"
            className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" />Add Event
          </Link>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? 'text-red-700' : 'text-slate-500', bg: stats.overdue > 0 ? 'bg-red-50' : 'bg-white' },
          { label: 'Due in 30 Days', value: stats.due30, color: stats.due30 > 0 ? 'text-orange-700' : 'text-slate-500', bg: stats.due30 > 0 ? 'bg-orange-50' : 'bg-white' },
          { label: 'Completed', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 px-4 py-3 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter pills ── */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap gap-2">
        {FILTER_OPTS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              filter === o.value ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {o.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-slate-400 self-center italic">{filtered.length} shown</span>
      </div>

      {/* ── View controls bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        {/* View tabs */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {(['month','week','list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                view === v ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {v === 'month' ? '📅 Month' : v === 'week' ? '🗓 Week' : '📋 List'}
            </button>
          ))}
        </div>
        {/* Navigation (month + week only) */}
        {view !== 'list' && (
          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[180px] text-center">{navLabel()}</span>
            <button onClick={next} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrent(new Date())}
              className="ml-1 text-xs text-teal-600 border border-teal-200 rounded px-2 py-1 hover:bg-teal-50 transition-colors">
              Today
            </button>
          </div>
        )}
        {dragId && (
          <span className="text-xs text-teal-600 italic bg-teal-50 px-2 py-1 rounded ml-2">
            Drag to a new date to reschedule
          </span>
        )}
      </div>

      {/* ── Calendar body ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {view === 'month' && renderMonth()}
        {view === 'week'  && renderWeek()}
        {view === 'list'  && renderList()}
      </div>

    </div>
  );
}