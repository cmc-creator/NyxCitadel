'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2, AlertCircle, Shield, CheckCircle,
  Lock, Eye, EyeOff, ArrowLeft,
  ClipboardList, BarChart3, AlertTriangle,
} from 'lucide-react';

const leftFeatures = [
  {
    icon: ClipboardList,
    title: 'Survey & Compliance',
    desc: 'Manage findings, POCs, and policy reviews in real time.',
  },
  {
    icon: BarChart3,
    title: 'Executive Dashboards',
    desc: 'Auto-generated board reports and compliance scorecards.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk & QAPI',
    desc: 'Proactive risk tracking and quality improvement projects.',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] bg-purple-700/20 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════════════
          LEFT PANEL — Branding
      ══════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Inner glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-slate-400 hover:text-white text-sm transition-colors mb-16">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-xl text-white tracking-tight">NyxCitadel</p>
              <p className="text-xs text-slate-500">Compliance &amp; Risk Platform</p>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
            Your facility's{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              compliance command center
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Everything your team needs to stay survey-ready, reduce risk,
            and drive quality improvement — in one platform.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-4">
          {leftFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-white/4 border border-white/5 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4.5 h-4.5 text-purple-400 w-[18px] h-[18px]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-400 text-sm leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div className="relative z-10 flex items-center gap-5 pt-8 border-t border-white/5">
          {[
            { icon: Lock,         label: 'HIPAA Secure' },
            { icon: Shield,       label: 'SOC 2 Ready' },
            { icon: CheckCircle,  label: 'CMS Aligned' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon className="w-3.5 h-3.5 text-green-500" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">NyxCitadel</span>
          </div>
          <p className="text-slate-500 text-sm">Compliance &amp; Risk Management Platform</p>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Card */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to access your facility portal</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-700/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/5">
              <p className="text-center text-slate-600 text-xs">
                Need access? Contact your system administrator.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-700 text-xs mt-5">
            © {new Date().getFullYear()} NyxCitadel · HIPAA-compliant platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

