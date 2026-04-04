'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[page error]', error);
    }
    // Report to Sentry if available
    try {
      // Dynamic import to avoid crashing if Sentry is not initialised
      import('@sentry/nextjs').then(({ captureException }) => {
        captureException(error);
      }).catch(() => {/* Sentry not available */});
    } catch {
      // ignore
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl border border-amber-400/30 bg-amber-400/10 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-amber-300" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">We hit an unexpected error</h1>
        <p className="mt-4 text-slate-300 leading-relaxed">
          NyxCitadel encountered a problem loading this page. Our team has been notified.
          Try refreshing — most issues resolve on their own.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
