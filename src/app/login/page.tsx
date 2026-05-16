'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
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
  {
    icon: () => <span className="text-xl">🤖</span>,
    title: 'Sentry AI Assistant',
    desc: 'Draft CAPs and incidents instantly with AI assistance.',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [requires2fa, setRequires2fa] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // If we haven't determined 2FA status yet, check first
    if (!requires2fa) {
      try {
        const check = await fetch('/api/auth/2fa/preflight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (check.ok) {
          const data = await check.json() as { requires2fa: boolean };
          if (data.requires2fa) {
            setRequires2fa(true);
            setLoading(false);
            return; // Show TOTP field, wait for resubmit
          }
        }
      } catch {
        // ignore preflight errors — fall through to normal signIn
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      ...(totpToken ? { totpToken } : {}),
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      if (requires2fa) {
        setError('Invalid authentication code. Please try again.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#060b16]">

      {/* ── Background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] bg-teal-700/12 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════════════
          LEFT PANEL - Branding
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-muted-foreground/70 hover:text-white text-sm transition-colors mb-16">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/citadellogo-clean.png"
              alt="NyxCitadel"
              width={64}
              height={64}
              unoptimized
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/logo-white.svg')) {
                  img.src = '/logo-white.svg';
                }
              }}
              className="h-16 w-auto flex-shrink-0 drop-shadow-[0_0_18px_rgba(13,115,119,0.6)]"
            />
            <div>
              <p className="font-bold text-xl text-white tracking-tight">NyxCitadel</p>
              <p className="text-xs text-slate-500">Compliance &amp; Risk Platform</p>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
            Your facility&apos;s
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              compliance command center
            </span>
          </h1>
          <p className="text-muted-foreground/70 text-lg leading-relaxed max-w-md">
            Everything your team needs to stay survey-ready, reduce risk,
            and drive quality improvement - in one platform.
          </p>
        </div>

        {/* Feature bullets - with hover animations */}
        <div className="relative z-10 space-y-4">
          {leftFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-white/4 border border-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/10 hover:-translate-x-1 transition-all duration-200 cursor-default">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-teal-500/40 transition-colors duration-200">
                <Icon className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-muted-foreground/70 text-sm leading-snug">{desc}</p>
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
          RIGHT PANEL - Login Form
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <Image
              src="/citadellogo-clean.png"
              alt="NyxCitadel"
              width={36}
              height={36}
              unoptimized
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/logo-white.svg')) {
                  img.src = '/logo-white.svg';
                }
              }}
              className="h-9 w-auto flex-shrink-0"
            />
            <span className="font-bold text-xl text-white">NyxCitadel</span>
          </div>
          <p className="text-slate-500 text-sm">Compliance &amp; Risk Management Platform</p>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Card */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-muted-foreground/70 text-sm mt-1">Sign in to access your facility portal</p>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition text-sm"
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
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition text-sm"
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

              {/* 2FA Code (shown only when required) */}
              {requires2fa && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Authenticator Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totpToken}
                    onChange={e => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition text-sm font-mono tracking-widest text-center"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Enter the 6-digit code from your authenticator app, or a backup code.</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-900/30"
                style={{background:'linear-gradient(135deg,#0d7377 0%,#14a4a8 100%)'}}
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
                Need access?{' '}
                <a href="/signup" className="text-teal-500 hover:text-teal-400 transition-colors">Request a demo</a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-foreground/80 text-xs mt-5">
            © {new Date().getFullYear()} <a href="https://nyxcollective.com" className="hover:text-slate-500 transition-colors">NyxCollective LLC</a> · NyxCitadel · HIPAA-compliant platform
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

