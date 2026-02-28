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
  DEADLINE_REMINDER:  'bg-amber-100 text-amber-700',
  OVERDUE_ALERT:      'bg-red-100   text-red-700',
  ASSIGNMENT:         'bg-blue-100  text-blue-700',
  SURVEY_ALERT:       'bg-purple-100 text-purple-700',
  CAP_UPDATE:         'bg-green-100 text-green-700',
  POLICY_REVIEW_DUE:  'bg-orange-100 text-orange-700',
  TRAINING_EXPIRING:  'bg-yellow-100 text-yellow-700',
  INCIDENT_UPDATE:    'bg-rose-100  text-rose-700',
  SYSTEM:             'bg-slate-100 text-slate-700',
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
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-purple-600' : 'text-slate-600'}`} />
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
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAll}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium transition"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`group px-4 py-3 hover:bg-slate-50 transition relative ${!n.isRead ? 'bg-purple-50/40' : ''}`}
                >
                  {/* Unread dot */}
                  {!n.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-500" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Type badge + title */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {n.type.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-auto">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className={`text-xs font-semibold truncate ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {n.linkUrl && (
                          <Link
                            href={n.linkUrl}
                            onClick={() => { void markOne(n.id); setOpen(false); }}
                            className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => void markOne(n.id)}
                            className="text-[11px] text-slate-400 hover:text-slate-700"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => void dismiss(n.id)}
                      className="p-0.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
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
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">Showing last {notifications.length} notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
