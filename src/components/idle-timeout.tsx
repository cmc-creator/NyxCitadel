'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 60 * 1000;    // warn 1 minute before

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click',
] as const;

export function IdleTimeout() {
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimers() {
      if (logoutTimer.current)  clearTimeout(logoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);

      warningTimer.current = setTimeout(() => {
        // Non-blocking in-page warning - replaces browser confirm to stay CSP-safe
        const banner = document.getElementById('__idle-warning-banner__');
        if (banner) banner.style.display = 'flex';
      }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

      logoutTimer.current = setTimeout(() => {
        signOut({ callbackUrl: '/login?reason=idle' });
      }, IDLE_TIMEOUT_MS);
    }

    function dismissWarning() {
      const banner = document.getElementById('__idle-warning-banner__');
      if (banner) banner.style.display = 'none';
      resetTimers();
    }

    // Inject warning banner into DOM once
    if (!document.getElementById('__idle-warning-banner__')) {
      const banner = document.createElement('div');
      banner.id = '__idle-warning-banner__';
      banner.style.cssText = [
        'display:none',
        'position:fixed',
        'bottom:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:#1e40af',
        'color:#fff',
        'padding:12px 24px',
        'border-radius:8px',
        'gap:16px',
        'align-items:center',
        'z-index:9999',
        'font-size:14px',
        'box-shadow:0 4px 12px rgba(0,0,0,0.3)',
      ].join(';');
      banner.innerHTML =
        'You will be signed out in 1 minute due to inactivity. ' +
        '<button onclick="this.closest(\'#__idle-warning-banner__\').style.display=\'none\'" ' +
        'style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:4px 12px;border-radius:4px;cursor:pointer;margin-left:8px">' +
        'Stay signed in</button>';
      banner.querySelector('button')?.addEventListener('click', dismissWarning);
      document.body.appendChild(banner);
    }

    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimers, { passive: true }));
    resetTimers();

    return () => {
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimers));
      if (logoutTimer.current)  clearTimeout(logoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, []);

  return null;
}
