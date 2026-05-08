"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, background: '#060b16', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2.5rem', maxWidth: 480 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: 8 }}>NyxCitadel</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#fff' }}>An unexpected error occurred</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            The application encountered an unrecoverable error. Your data is safe.
            {error.digest && <span style={{ display: 'block', marginTop: 6, fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>ID: {error.digest}</span>}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#0d7377,#14a4a8)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Try again
            </button>
            <a href="/" style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
