import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl border border-amber-400/30 bg-amber-400/10 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-amber-300" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Page Not Found</h1>
        <p className="mt-4 text-slate-300 leading-relaxed">
          The page you requested could not be found or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
