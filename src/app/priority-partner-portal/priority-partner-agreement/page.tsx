import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Handshake } from 'lucide-react';

export const metadata = {
  title: 'Priority Partner Agreement | NyxCitadel',
  description: 'NyxCitadel Priority Partner Agreement with early-access pricing protections, implementation milestones, KPI acceptance criteria, and expansion rights for qualified healthcare partners.',
};

const items = [
  {
    title: '1. Parties and Effective Date',
    text: 'This Priority Partner Agreement is entered into by and between NyxCitadel, Inc. and [PARTNER_LEGAL_NAME], effective as of [EFFECTIVE_DATE].',
  },
  {
    title: '2. Program Scope',
    text: 'Partner receives early-priority onboarding, implementation governance, and designated support channels for facilities listed in Schedule A.',
  },
  {
    title: '3. Commercial Terms and Price Protection',
    text: 'Pricing, discount structure, and protection windows are set in Schedule B and remain fixed for [PRICE_PROTECTION_MONTHS] months, subject to partner compliance with rollout commitments.',
  },
  {
    title: '4. Implementation Milestones',
    text: 'Milestones, owners, and target dates are listed in Schedule C. Delays exceeding [DELAY_NOTICE_DAYS] days require written change control by both parties.',
  },
  {
    title: '5. KPI Outcomes and Acceptance',
    text: 'Operational KPIs, baseline date, measurement method, and acceptance threshold are documented in Schedule D and reviewed through monthly governance meetings.',
  },
  {
    title: '6. Expansion Rights',
    text: 'Following successful acceptance, partner may add facilities and modules under pre-negotiated expansion pricing in Schedule B, subject to order form execution.',
  },
  {
    title: '7. Confidentiality and Data Protection',
    text: 'The parties will comply with confidentiality obligations under the Master Agreement and applicable data protection terms, including executed HIPAA documentation where required.',
  },
  {
    title: '8. Term, Termination, and Transition',
    text: 'This Agreement remains effective during the partner term in Schedule B unless terminated for uncured material breach within [CURE_PERIOD_DAYS] days. Transition obligations are listed in Schedule E.',
  },
  {
    title: '9. Governing Law and Dispute Venue',
    text: 'This Agreement is governed by [GOVERNING_STATE] law. Disputes are resolved in [VENUE_COUNTY_STATE], except as otherwise required by non-waivable law.',
  },
];

export default function PartnerAgreementPage() {
  return (
    <div className="min-h-screen bg-[#060b16] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-800/8 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/citadellogo-clean.png" alt="NyxCitadel" width={40} height={40} unoptimized
            className="h-10 w-auto rounded-lg flex-shrink-0 drop-shadow-[0_0_12px_rgba(13,115,119,0.45)]" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm text-white">NyxCitadel<sup className="text-[9px] font-normal text-teal-400">™</sup></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Healthcare Compliance</span>
          </div>
        </Link>
        <Link href="/priority-partner-portal" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/8 hover:border-white/15 px-3.5 py-2 rounded-xl transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Partner Portal
        </Link>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 py-12">

        <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-100">
            <Handshake className="h-3.5 w-3.5" />
            Partner Program Terms
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Priority Partner Agreement</h1>
          <p className="mt-3 text-sm text-teal-50/95 leading-relaxed">
            Contract-ready draft with schedules and placeholders for legal redline and procurement execution.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Drafting Placeholders</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            [PARTNER_LEGAL_NAME], [EFFECTIVE_DATE], [PRICE_PROTECTION_MONTHS], [DELAY_NOTICE_DAYS], [CURE_PERIOD_DAYS], [GOVERNING_STATE], [VENUE_COUNTY_STATE]
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <section key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.text}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">Schedules</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>- Schedule A: Covered facilities and user volumes</p>
            <p>- Schedule B: Pricing, fees, and expansion economics</p>
            <p>- Schedule C: Implementation plan and governance cadence</p>
            <p>- Schedule D: KPI baseline, methodology, and acceptance criteria</p>
            <p>- Schedule E: Termination transition support matrix</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">10. Signature Blocks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold">Priority Partner</p>
              <p>Legal Entity: [PARTNER_LEGAL_NAME]</p>
              <p>Name: [PARTNER_SIGNER_NAME]</p>
              <p>Title: [PARTNER_SIGNER_TITLE]</p>
              <p>Signature: ________________________</p>
              <p>Date: ________________________</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold">NyxCitadel, Inc.</p>
              <p>Name: [NYXCITADEL_SIGNER_NAME]</p>
              <p>Title: [NYXCITADEL_SIGNER_TITLE]</p>
              <p>Signature: ________________________</p>
              <p>Date: ________________________</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
