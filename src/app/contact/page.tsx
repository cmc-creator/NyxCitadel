import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail, Clock3, ShieldCheck, ArrowLeft,
  MessageSquare, ChevronRight, Lock, CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact NyxCitadel | Sales, Legal & Support',
  description: 'Get in touch with NyxCitadel. Contact our sales team for demos and pricing, legal for BAA and security reviews, or support for platform questions. HIPAA BAA included on all plans.',
  openGraph: {
    title: 'Contact NyxCitadel',
    description: 'Get in touch with NyxCitadel — sales, legal, and support.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Contact NyxCitadel' },
};

const contacts = [
  {
    label: 'Sales',
    detail: 'Pricing, demos, procurement, and contract review',
    value: 'sales@nyxcitadel.com',
    href: 'mailto:sales@nyxcitadel.com',
    icon: MessageSquare,
    color: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    response: '1 business day',
  },
  {
    label: 'Legal',
    detail: 'BAA review, DPA, security questionnaires, compliance docs',
    value: 'legal@nyxcitadel.com',
    href: 'mailto:legal@nyxcitadel.com',
    icon: ShieldCheck,
    color: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    response: '2 business days',
  },
  {
    label: 'Support',
    detail: 'Platform issues, how-to questions, and onboarding help',
    value: 'support@nyxcitadel.com',
    href: 'mailto:support@nyxcitadel.com',
    icon: Mail,
    color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    response: 'Same business day',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-700/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-blue-800/12 rounded-full blur-[110px]" />
      </div>

      {/* Header nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/citadellogo-clean.png"
            alt="NyxCitadel"
            width={40}
            height={40}
            unoptimized
            className="h-10 w-auto rounded-lg flex-shrink-0 drop-shadow-[0_0_12px_rgba(13,115,119,0.45)]"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-white">NyxCitadel<sup className="text-[9px] font-normal text-teal-400">™</sup></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Healthcare Compliance</span>
          </div>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-2 rounded-xl transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to site
        </Link>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-20">

        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-4 py-1.5 text-xs font-medium text-teal-300 mb-6">
            <MessageSquare className="w-3.5 h-3.5" /> We respond fast. Always.
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">
            Talk to{'\u00a0'}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              NyxCitadel
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Whether you're evaluating pricing, reviewing our security posture, or need onboarding help —
            we have a dedicated team for every conversation.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-14">
          {contacts.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative rounded-2xl border border-white/8 bg-slate-900/50 p-6 hover:border-teal-500/30 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-teal-900/20 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{item.label}</p>
                    <span className="text-[11px] text-slate-600 flex-shrink-0">{item.response}</span>
                  </div>
                  <p className="text-base font-bold text-white mb-2 truncate">{item.value}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-teal-400" />
              </div>
            </a>
          ))}
        </div>

        {/* Response times */}
        <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-7 mb-10 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <Clock3 className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-base font-bold text-white">Guaranteed Response Windows</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Sales & Procurement', time: '≤ 1 business day', color: 'text-teal-400' },
              { label: 'Legal & Security Review', time: '≤ 2 business days', color: 'text-blue-400' },
              { label: 'Support Triage', time: 'Same business day', color: 'text-emerald-400' },
            ].map(({ label, time, color }) => (
              <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-4">
                <p className={`text-lg font-extrabold mb-1 ${color}`}>{time}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust + CTA bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-5">
            {[
              { icon: Lock, label: 'HIPAA BAA on all plans' },
              { icon: ShieldCheck, label: 'SOC 2 security posture' },
              { icon: CheckCircle, label: 'No-pressure evaluations' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <Icon className="w-3.5 h-3.5 text-green-500" /> {label}
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)', boxShadow: '0 4px 20px rgba(13,115,119,0.3)' }}
          >
            Request Access <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

