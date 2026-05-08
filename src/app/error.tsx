'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error captured by instrumentation globally
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060b16] text-white flex items-center justify-center px-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-700/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="rounded-3xl border border-white/8 bg-slate-900/60 backdrop-blur-sm p-10 shadow-2xl">
          <div className="mx-auto w-14 h-14 rounded-2xl border border-rose-400/30 bg-rose-400/10 flex items-center justify-center mb-5">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">Error</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3">
            Something went wrong
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            An unexpected error occurred. Your data is safe — please try again or return home.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-600 font-mono mb-6">
              ID: {error.digest}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/12 hover:border-white/25 text-slate-300 hover:text-white text-sm transition-all"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-600">
            If this keeps happening, contact{' '}
            <a href="mailto:support@nyxcitadel.com" className="text-teal-500 hover:text-teal-400 inline-flex items-center gap-1">
              <Mail className="w-3 h-3" />support@nyxcitadel.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
