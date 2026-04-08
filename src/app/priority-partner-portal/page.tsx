import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  Building2,
  FileSignature,
  Handshake,
  Shield,
  Scale,
  Receipt,
  Landmark,
} from 'lucide-react';
import PartnerPreviewImage from '@/components/partners/PartnerPreviewImage';

export const metadata = {
  title: 'Priority Partner Portal | NyxCitadel',
  description: 'Legal, commercial, and procurement resources for healthcare organizations evaluating NyxCitadel. Review the BAA, Terms of Service, Priority Partner Agreement, and Lease-Buy commercial options.',
  openGraph: {
    title: 'NyxCitadel Priority Partner Portal',
    description: 'Contracts, legal documents, and commercial options for healthcare procurement teams evaluating NyxCitadel.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'NyxCitadel Priority Partner Portal' },
};

const legalCards = [
  {
    href: '/priority-partner-portal/baa',
    title: 'Business Associate Agreement (BAA)',
    summary:
      'HIPAA responsibilities, PHI safeguards, breach notification windows, and permitted uses/disclosures.',
    icon: Shield,
    tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  },
  {
    href: '/priority-partner-portal/terms',
    title: 'Terms of Service',
    summary:
      'Service terms, subscriptions, uptime targets, support boundaries, and customer obligations.',
    icon: FileSignature,
    tone: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  },
  {
    href: '/priority-partner-portal/priority-partner-agreement',
    title: 'Priority Partner Agreement',
    summary:
      'Early-access pricing protections, onboarding commitments, implementation milestones, and governance cadence.',
    icon: Handshake,
    tone: 'border-teal-500/30 bg-teal-500/10 text-teal-100',
  },
  {
    href: '/priority-partner-portal/lease-buy-options',
    title: 'Lease-Buy Commercial Options',
    summary:
      'Operating lease, lease-to-own, and direct purchase options with transparent cost and conversion terms.',
    icon: Landmark,
    tone: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  },
];

const checklist = [
  'Executed BAA and Terms of Service',
  'Approved procurement path (lease, lease-to-own, or direct buy)',
  'Defined implementation timeline with named stakeholders',
  'Security review complete with controls confirmation',
  'Pilot KPI baseline and success criteria accepted',
];

const pricingOptions = [
  {
    label: 'Starter',
    price: '$399/mo',
    note: '1 facility, up to 5 users, annual billing',
  },
  {
    label: 'Professional',
    price: '$799/mo',
    note: 'Up to 3 facilities, up to 20 users, annual billing',
  },
  {
    label: 'Enterprise',
    price: 'Custom',
    note: 'Unlimited facilities/users with negotiated terms',
  },
];

const appPreviews = [
  {
    src: '/partner-previews/real/dashboard.png',
    fallbackSrc: '/partner-previews/dashboard-preview.svg',
    alt: 'NyxCitadel dashboard preview',
    title: 'Operational Dashboard',
  },
  {
    src: '/partner-previews/real/compliance.png',
    fallbackSrc: '/partner-previews/compliance-preview.svg',
    alt: 'NyxCitadel compliance workspace preview',
    title: 'Compliance Workspace',
  },
  {
    src: '/partner-previews/real/executive.png',
    fallbackSrc: '/partner-previews/executive-preview.svg',
    alt: 'NyxCitadel executive reporting preview',
    title: 'Executive Reporting',
  },
];

export default function PriorityPartnerPortalPage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-700/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5">
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-14">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
            Priority Partner Portal
          </div>
          <h1 className="mt-5 text-4xl lg:text-5xl font-extrabold tracking-tight">
            Contracts, Legal, and Commercial Options in One Place
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300 text-lg leading-relaxed">
            This portal is designed for legal, compliance, procurement, and executive stakeholders.
            Review all core agreements and financing options required to operationalize NyxCitadel
            in a production healthcare environment.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/priority-partner-portal/baa"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition"
            >
              Review BAA
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/priority-partner-portal/lease-buy-options"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100 transition"
            >
              Compare Lease/Buy Options
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {legalCards.map(({ href, title, summary, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href}
              className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 ${tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg border border-white/20 bg-black/20 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 opacity-60 group-hover:opacity-100 transition" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{summary}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-white/15 bg-white/5 p-2 mt-0.5">
              <Receipt className="h-4 w-4 text-slate-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Priority Partner Activation Checklist</h2>
              <p className="mt-1 text-sm text-slate-300">
                Procurement can use this checklist to move from legal review to implementation without rework.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-2" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-white">Pricing Options</h2>
          <p className="mt-2 text-sm text-amber-50/95 leading-relaxed">
            Yes, pricing options are included. Use these base package prices for budget planning, then apply lease, lease-to-own, or direct purchase terms in the commercial schedule.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {pricingOptions.map((option) => (
              <div key={option.label} className="rounded-xl border border-amber-300/30 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">{option.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-white">{option.price}</p>
                <p className="mt-2 text-sm text-amber-50/90">{option.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/priority-partner-portal/lease-buy-options"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100 transition"
            >
              Open Commercial Schedule Draft
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-white">App Preview Images</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Product visuals are now included so legal, procurement, and executive reviewers can quickly understand what teams will use after contract execution.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {appPreviews.map((preview) => (
              <div key={preview.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <div className="relative overflow-hidden rounded-lg border border-white/10">
                  <PartnerPreviewImage
                    primarySrc={preview.src}
                    fallbackSrc={preview.fallbackSrc}
                    alt={preview.alt}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-100">{preview.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-cyan-200 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-white">Need a redline-ready contract packet?</h2>
              <p className="mt-1 text-sm text-cyan-100 leading-relaxed">
                Request a counterpart-ready legal packet and implementation statement of work.
                Priority Partner teams receive expedited legal and procurement support.
              </p>
              <div className="mt-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
                  style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
                >
                  Request Priority Partner Onboarding
                  <Scale className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
