import Link from 'next/link';
import { ArrowLeft, Handshake } from 'lucide-react';

export const metadata = {
  title: 'Priority Partner Agreement',
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/priority-partner-portal" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Priority Partner Portal
        </Link>

        <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-100">
            <Handshake className="h-3.5 w-3.5" />
            Partner Program Terms
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Priority Partner Agreement</h1>
          <p className="mt-3 text-sm text-violet-50/95 leading-relaxed">
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
