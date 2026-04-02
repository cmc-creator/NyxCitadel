'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, X, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  linkUrl: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  DEADLINE_REMINDER:      'bg-amber-500/15 text-amber-400',
  OVERDUE_ALERT:          'bg-red-500/15   text-red-400',
  ASSIGNMENT:             'bg-blue-500/15  text-blue-400',
  SURVEY_ALERT:           'bg-teal-500/15 text-teal-400',
  CAP_UPDATE:             'bg-emerald-500/15 text-emerald-400',
  POLICY_REVIEW_DUE:      'bg-orange-500/15 text-orange-400',
  TRAINING_EXPIRING:      'bg-amber-500/15 text-amber-400',
  INCIDENT_UPDATE:        'bg-rose-500/15  text-rose-400',
  SYSTEM:                 'bg-slate-500/10 text-muted-foreground/70',
  // Compliance alert types
  LICENSE_EXPIRING:       'bg-amber-500/15 text-amber-400',
  CS_DISCREPANCY:         'bg-red-500/20   text-red-300',
  TB_OVERDUE:             'bg-orange-500/15 text-orange-400',
  MOON_MISSING:           'bg-yellow-500/15 text-yellow-400',
  GOVERNANCE_DOC_OVERDUE: 'bg-teal-500/15 text-indigo-400',
  BREACH_REPORTABLE:      'bg-red-600/20   text-red-300',
  REGULATORY_UPDATE:      'bg-teal-500/15 text-teal-400',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);
  const [markingAll, setMarkingAll]         = useState(false);
  const panelRef                            = useRef<HTMLDivElement>(null);
  const buttonRef                           = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json() as { notifications: Notification[]; unreadCount: number };
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 60 s
  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markOne = async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
  };

  const markAll = async () => {
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch('/api/notifications', { method: 'PATCH' });
    setMarkingAll(false);
  };

  const dismiss = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notifications.find(n => n.id === id)?.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-muted transition"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-brand' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-0.5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-96 bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500/15 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAll}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 font-medium transition"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`group px-4 py-3 hover:bg-muted/40 transition relative ${!n.isRead ? 'bg-brand/5' : ''}`}
                >
                  {/* Unread dot */}
                  {!n.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Type badge + title */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {n.type.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className={`text-xs font-semibold truncate ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {n.linkUrl && (
                          <Link
                            href={n.linkUrl}
                            onClick={() => { void markOne(n.id); setOpen(false); }}
                            className="flex items-center gap-1 text-[11px] text-brand hover:text-brand/80 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => void markOne(n.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => void dismiss(n.id)}
                      className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Showing last {notifications.length} notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
