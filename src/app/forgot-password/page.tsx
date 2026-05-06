'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b16] px-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] bg-teal-700/12 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/citadellogo-clean.png"
            alt="NyxCitadel"
            width={40}
            height={40}
            unoptimized
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.includes('/logo-white.svg')) img.src = '/logo-white.svg';
            }}
            className="h-10 w-auto"
          />
          <span className="font-bold text-lg text-white">NyxCitadel</span>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>, we&apos;ve sent a password reset link. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-teal-400 hover:text-teal-300 text-sm transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@facility.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-900/30"
                  style={{ background: 'linear-gradient(135deg,#0d7377 0%,#14a4a8 100%)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          © {new Date().getFullYear()}{' '}
          <a href="https://nyxcollective.com" className="hover:text-slate-500 transition-colors">
            NyxCollective LLC
          </a>{' '}
          · NyxCitadel · HIPAA-compliant platform
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
