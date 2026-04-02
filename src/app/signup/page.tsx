'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle,
  Building2, Mail, Phone, User, ChevronRight, Loader2,
  Sparkles, BarChart2, ClipboardList, AlertTriangle,
  Star,
} from 'lucide-react';

const PLAN_FEATURES = {
  starter: ['1 Facility', '5 Users', 'Compliance Calendar', 'Policy Manager', 'Incident Tracker', 'CAP Tracker', 'Email Support'],
  professional: ['3 Facilities', '20 Users', 'Everything in Starter', 'Sentry™ Assistant', 'Emergency Management', 'QAPI / Board Reports', 'Resilience Scorecard', 'Priority Support'],
  enterprise: ['Unlimited Facilities', 'Unlimited Users', 'Everything in Professional', 'White-Label Option', 'SSO / SAML', 'Dedicated Consultant', 'SLA Guarantee', 'Custom Integrations'],
};



export default function SignupPage() {
  const [tab, setTab] = useState<'demo' | 'request'>('demo');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', facility: '', phone: '', facilityType: '', beds: '', message: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Request failed');
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Signup error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Request failed. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] bg-purple-700/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[130px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/citadellogo-v2.png"
            alt="NyxCitadel"
            width={32}
            height={32}
            className="h-8 w-auto rounded-lg flex-shrink-0"
          />
          <span className="font-bold text-white tracking-tight">NyxCitadel<sup className="text-[10px] align-super ml-0.5 font-normal text-purple-400">™</sup></span>
        </Link>
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Sign in instead
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 py-12">
        {/* Heading */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-purple-300 mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Built for Behavioral Health &amp; Acute Psychiatric Facilities
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Get started with{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              NyxCitadel<sup className="text-base align-super">™</sup>
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Explore the live demo instantly, or request access for your facility. Full platform, real data - no credit card required to evaluate.
          </p>
          <div className="mt-5 flex items-center justify-center gap-4 text-sm">
            <Link href="/guide" className="text-slate-400 hover:text-white transition-colors">Read the user guide</Link>
            <Link href="/walkthrough" className="text-purple-300 hover:text-purple-200 transition-colors">Watch the walkthrough</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-slate-900/60 border border-white/8 rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('demo')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'demo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Try Live Demo
          </button>
          <button
            onClick={() => setTab('request')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'request' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Request Access
          </button>
        </div>

        {tab === 'demo' && (
          <div className="w-full max-w-4xl space-y-6">

            {/* What you'll see */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: BarChart2, title: 'Compliance Command Center', desc: 'Live dashboard with overdue events, watch-list alerts, training compliance bars, and real-time QAPI metrics.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/15' },
                { icon: ClipboardList, title: '10+ Tracking Modules', desc: 'Incidents, CAPs, grievances, QOC/LOI, IR/IAD, policies, training, risk assessments, and more.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
                { icon: AlertTriangle, title: 'AI-Powered Triage', desc: 'Sentry™ assistant answers CMS/JC/ADHS questions, drafts CAP language, and interprets regulatory standards.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className={`rounded-xl border p-5 ${color}`}>
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3 border`}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing reminder */}
            <div className="bg-slate-900/40 border border-white/6 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Pricing Overview
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { name: 'Starter', price: '$399', period: '/mo', features: PLAN_FEATURES.starter, highlight: false },
                  { name: 'Professional', price: '$799', period: '/mo', features: PLAN_FEATURES.professional, highlight: true },
                  { name: 'Enterprise', price: 'Custom', period: '', features: PLAN_FEATURES.enterprise, highlight: false },
                ].map(plan => (
                  <div key={plan.name} className={`rounded-xl p-4 border ${plan.highlight ? 'bg-purple-600/10 border-purple-500/30' : 'bg-slate-800/30 border-white/8'}`}>
                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-sm font-bold text-white">{plan.name}</p>
                      <p className="text-sm font-bold text-purple-400">{plan.price}<span className="text-xs font-normal text-slate-500">{plan.period}</span></p>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features.slice(0, 5).map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-slate-600 pl-4">+{plan.features.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-4 text-center">Annual billing available · 30-day money-back guarantee · HIPAA BAA included on all plans</p>
            </div>
          </div>
        )}

        {tab === 'request' && (
          <div className="w-full max-w-xl">
            {submitted ? (
              <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-10 text-center backdrop-blur-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Request received!</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  We'll be in touch within 1 business day to schedule your personalized demo and discuss your facility's needs.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Sign in <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-8 backdrop-blur-sm">
                <div className="mb-7">
                  <h2 className="text-xl font-bold text-white">Request access</h2>
                  <p className="text-slate-400 text-sm mt-1">Tell us about your facility and we'll reach out within 1 business day.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Your name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          required type="text" placeholder="Jane Smith"
                          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Work email <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          required type="email" placeholder="you@facility.com"
                          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Facility name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        required type="text" placeholder="Sunridge Behavioral Health"
                        value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Facility type</label>
                      <select
                        value={form.facilityType} onChange={e => setForm(f => ({ ...f, facilityType: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-slate-300 focus:outline-none focus:border-purple-500/60 transition"
                      >
                        <option value="">Select type</option>
                        <option value="acute_psych">Acute Psychiatric</option>
                        <option value="residential">Residential BH</option>
                        <option value="crisis">Crisis Stabilization</option>
                        <option value="outpatient">Outpatient / PHP</option>
                        <option value="ltach">LTACH / SNF</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Bed count</label>
                      <input
                        type="number" placeholder="e.g. 60" min="1"
                        value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        type="tel" placeholder="(602) 555-0100"
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">What are your biggest compliance challenges? (optional)</label>
                    <textarea
                      rows={3} placeholder="e.g. managing Joint Commission survey readiness, tracking sentinel events, staff training compliance..."
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/70 border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Request Access <ChevronRight className="w-4 h-4" /></>}
                  </button>

                  {submitError && (
                    <p className="text-xs text-rose-300 text-center">{submitError}</p>
                  )}

                  <p className="text-xs text-slate-600 text-center">
                    By submitting, you agree to our <Link href="/privacy" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</Link> and <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline">Terms of Service</Link>. We never sell or share your information.
                  </p>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} NyxCitadel<sup className="text-[9px]">™</sup> · HIPAA Compliant · <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link> · <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact</Link> · <Link href="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
        </p>
      </footer>
    </div>
  );
}
