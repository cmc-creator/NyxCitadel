import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calculator, Landmark, Wallet } from 'lucide-react';

export const metadata = {
  title: 'Lease-Buy Options | NyxCitadel Partner Portal',
  description: 'Compare NyxCitadel commercial options: operating lease, lease-to-own, and direct purchase. Includes budgetary package pricing and first-year cost estimates for procurement planning.',
};

const models = [
  {
    title: '1. Operating Lease Model',
    icon: Wallet,
    points: [
      'Monthly lease amount: [OPERATING_LEASE_MONTHLY_FEE].',
      'Initial term: [OPERATING_LEASE_TERM_MONTHS] months.',
      'Renewal option and upgrade rights: [OPERATING_LEASE_RENEWAL_TERMS].',
    ],
  },
  {
    title: '2. Lease-to-Own Model',
    icon: Calculator,
    points: [
      'Monthly fee: [LTO_MONTHLY_FEE].',
      'Conversion milestone date: [LTO_CONVERSION_DATE].',
      'Conversion amount and ownership terms: [LTO_CONVERSION_TERMS].',
    ],
  },
  {
    title: '3. Direct Purchase Model',
    icon: Landmark,
    points: [
      'Upfront platform fee: [DIRECT_PURCHASE_FEE].',
      'Annual support and maintenance: [DIRECT_ANNUAL_SUPPORT_FEE].',
      'Deployment billing milestones: [DIRECT_BILLING_MILESTONES].',
    ],
  },
];

const packagePricing = [
  {
    packageName: 'Starter Package',
    listPrice: '$399/mo',
    annual: '$4,788/year',
  },
  {
    packageName: 'Professional Package',
    listPrice: '$799/mo',
    annual: '$9,588/year',
  },
  {
    packageName: 'Enterprise Package',
    listPrice: 'Custom',
    annual: 'Custom annual schedule',
  },
];

const firstYearEstimates = [
  {
    model: 'Operating Lease',
    starter: '$4,788 to $7,188',
    professional: '$9,588 to $14,388',
    enterprise: 'Custom annual lease schedule',
  },
  {
    model: 'Lease-to-Own',
    starter: '$5,388 to $7,788',
    professional: '$10,788 to $15,588',
    enterprise: 'Custom conversion schedule',
  },
  {
    model: 'Direct Purchase',
    starter: '$7,500 to $12,500',
    professional: '$15,000 to $25,000',
    enterprise: 'Custom capital proposal',
  },
];

export default function LeaseBuyOptionsPage() {
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

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-12">

        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Lease-Buy Commercial Options</h1>
          <p className="mt-3 text-sm text-amber-50/95 leading-relaxed">
            Contract-ready commercial schedule draft. Replace bracketed placeholders during redline and attach to the executed Order Form.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Drafting Placeholders</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            [OPERATING_LEASE_MONTHLY_FEE], [OPERATING_LEASE_TERM_MONTHS], [OPERATING_LEASE_RENEWAL_TERMS], [LTO_MONTHLY_FEE], [LTO_CONVERSION_DATE], [LTO_CONVERSION_TERMS], [DIRECT_PURCHASE_FEE], [DIRECT_ANNUAL_SUPPORT_FEE], [DIRECT_BILLING_MILESTONES]
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="text-lg font-bold">Budgetary Package Pricing</h2>
          <p className="mt-2 text-sm text-amber-50/95 leading-relaxed">
            These package prices are for budgeting and procurement intake. Final payable amounts depend on the selected commercial model and executed schedule.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {packagePricing.map((row) => (
              <div key={row.packageName} className="rounded-lg border border-amber-300/30 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">{row.packageName}</p>
                <p className="mt-2 text-2xl font-extrabold text-white">{row.listPrice}</p>
                <p className="mt-1 text-sm text-amber-50/90">{row.annual}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
          <h2 className="text-lg font-bold text-white">Estimated First-Year Cost by Model</h2>
          <p className="mt-2 text-sm text-sky-50/95 leading-relaxed">
            Budgetary estimate ranges for procurement planning. Final commercial values are governed by the executed Order Form and schedules.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-sky-100">
                  <th className="border-b border-sky-300/30 px-3 py-2">Model</th>
                  <th className="border-b border-sky-300/30 px-3 py-2">Starter</th>
                  <th className="border-b border-sky-300/30 px-3 py-2">Professional</th>
                  <th className="border-b border-sky-300/30 px-3 py-2">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {firstYearEstimates.map((row) => (
                  <tr key={row.model} className="text-slate-100">
                    <td className="border-b border-sky-300/20 px-3 py-2 font-semibold">{row.model}</td>
                    <td className="border-b border-sky-300/20 px-3 py-2">{row.starter}</td>
                    <td className="border-b border-sky-300/20 px-3 py-2">{row.professional}</td>
                    <td className="border-b border-sky-300/20 px-3 py-2">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {models.map(({ title, icon: Icon, points }) => (
            <section key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2">
                <Icon className="h-4 w-4 text-amber-200" />
              </div>
              <h2 className="mt-3 text-lg font-bold">{title}</h2>
              <div className="mt-3 space-y-2">
                {points.map((point) => (
                  <p key={point} className="text-sm text-slate-300 leading-relaxed">
                    - {point}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">4. Commercial Governance Terms</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>- Invoicing cadence: [INVOICE_CADENCE]</p>
            <p>- Payment terms: Net [PAYMENT_DAYS] days</p>
            <p>- Late fee: [LATE_FEE_PERCENT]% per month or maximum lawful rate</p>
            <p>- Early termination fee treatment: [EARLY_TERMINATION_TERMS]</p>
            <p>- Law and venue: [GOVERNING_STATE] / [VENUE_COUNTY_STATE]</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">5. Signature Blocks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold">Customer</p>
              <p>Legal Entity: [CUSTOMER_LEGAL_NAME]</p>
              <p>Name: [CUSTOMER_SIGNER_NAME]</p>
              <p>Title: [CUSTOMER_SIGNER_TITLE]</p>
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
