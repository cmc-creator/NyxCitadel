import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | NyxCitadel Partner Portal',
  description: 'NyxCitadel commercial Terms of Service for healthcare organizations. Covers subscription terms, fees, customer responsibilities, warranties, liability limits, and governing law.',
};

const terms = [
  {
    title: '1. Agreement Structure',
    detail: 'These Terms of Service are incorporated into and governed by the executed Order Form and any applicable exhibits, including the BAA and Security Addendum.',
  },
  {
    title: '2. Grant of Rights',
    detail: 'Subject to payment and compliance, Customer receives a non-exclusive, non-transferable right to access and use NyxCitadel for internal business and healthcare compliance operations during the Subscription Term.',
  },
  {
    title: '3. Subscription Term and Renewal',
    detail: 'Initial term is [INITIAL_TERM_MONTHS] months commencing on [SUBSCRIPTION_START_DATE]. Renewal terms and notice windows are as set forth in the applicable Order Form.',
  },
  {
    title: '4. Fees and Payment',
    detail: 'Fees are payable as specified in the Order Form. Late amounts may accrue charges at the lesser of [LATE_FEE_PERCENT]% per month or the maximum rate permitted by law.',
  },
  {
    title: '5. Customer Responsibilities',
    detail: 'Customer is responsible for account administration, lawful data submission, user access governance, and independent verification of regulatory decisions where required by policy or law.',
  },
  {
    title: '6. Security and Privacy',
    detail: 'NyxCitadel will maintain commercially reasonable safeguards for customer data and PHI in accordance with applicable law and executed data protection documents.',
  },
  {
    title: '7. Confidentiality',
    detail: 'Each party will protect the other party\'s Confidential Information using at least reasonable care and only disclose such information to personnel and advisors with a need to know and appropriate confidentiality duties.',
  },
  {
    title: '8. Warranties and Disclaimers',
    detail: 'NyxCitadel warrants services will be provided in a professional and workmanlike manner. Except as expressly stated, services are provided as-is and all implied warranties are disclaimed to the extent permitted by law.',
  },
  {
    title: '9. Limitation of Liability',
    detail: 'Except for excluded claims stated in the Master Agreement, each party\'s aggregate liability will not exceed [LIABILITY_CAP_FORMULA]. Neither party is liable for indirect, incidental, special, consequential, or punitive damages.',
  },
  {
    title: '10. Termination',
    detail: 'Either party may terminate for material breach not cured within [CURE_PERIOD_DAYS] days after written notice. Sections that should survive termination remain in effect according to their nature.',
  },
  {
    title: '11. Governing Law and Venue',
    detail: 'These Terms are governed by the laws of [GOVERNING_STATE], excluding conflict-of-law rules. Venue is exclusively in [VENUE_COUNTY_STATE], unless otherwise required by law.',
  },
];

export default function TermsPage() {
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

        <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
            <FileText className="h-3.5 w-3.5" />
            Commercial Terms Preview
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-sm text-sky-50/95 leading-relaxed">
            Contract-ready draft for legal redline. Replace bracketed placeholders before execution.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Drafting Placeholders</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            [INITIAL_TERM_MONTHS], [SUBSCRIPTION_START_DATE], [LATE_FEE_PERCENT], [LIABILITY_CAP_FORMULA], [CURE_PERIOD_DAYS], [GOVERNING_STATE], [VENUE_COUNTY_STATE]
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {terms.map((item) => (
            <section key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.detail}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">12. Signature Blocks</h2>
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
