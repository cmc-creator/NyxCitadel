import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Business Associate Agreement (BAA)',
};

const sections = [
  {
    title: '1. Definitions',
    body: 'Capitalized terms have the meaning assigned under HIPAA, HITECH, and applicable state privacy law. Covered Entity means [COVERED_ENTITY_NAME]. Business Associate means NyxCitadel, Inc. Effective Date means [EFFECTIVE_DATE].',
  },
  {
    title: '2. Scope of Services and PHI Use',
    body: 'Business Associate may create, receive, maintain, and transmit PHI solely to perform services described in the Master Services Agreement and as otherwise permitted by law. Any use or disclosure outside this scope requires prior written authorization from Covered Entity.',
  },
  {
    title: '3. Safeguards',
    body: 'Business Associate will implement and maintain appropriate administrative, technical, and physical safeguards to protect PHI, including encryption in transit and at rest, access controls, logging, and workforce security training reasonably aligned to the risk profile.',
  },
  {
    title: '4. Breach and Security Incident Notification',
    body: 'Business Associate will notify Covered Entity without unreasonable delay, and no later than [BREACH_NOTICE_WINDOW_DAYS] calendar days after discovery of a Breach of Unsecured PHI. Notice will include known facts, impact summary, mitigation steps, and remediation plan.',
  },
  {
    title: '5. Subcontractors',
    body: 'Business Associate will ensure each subcontractor that creates, receives, maintains, or transmits PHI agrees in writing to restrictions and safeguards materially equivalent to this Agreement.',
  },
  {
    title: '6. Access, Amendment, and Accounting Support',
    body: 'Business Associate will provide reasonable cooperation and information necessary for Covered Entity to meet its obligations related to access, amendment, and accounting of disclosures under applicable law.',
  },
  {
    title: '7. Return or Destruction of PHI',
    body: 'Upon termination, Business Associate will return or destroy PHI where feasible. If return or destruction is infeasible, Business Associate will continue protections and limit further uses/disclosures to those making return or destruction infeasible.',
  },
  {
    title: '8. Term and Termination',
    body: 'This Agreement is effective as of the Effective Date and remains in force while Business Associate performs services involving PHI. Material breach not cured within [CURE_PERIOD_DAYS] days after written notice permits termination by non-breaching party.',
  },
  {
    title: '9. Governing Law and Venue',
    body: 'This Agreement is governed by the laws of [GOVERNING_STATE], without regard to conflict-of-law principles, except where superseded by federal privacy law. Venue is [VENUE_COUNTY_STATE].',
  },
];

export default function BaaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/priority-partner-portal" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Priority Partner Portal
        </Link>

        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Legal Preview
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Business Associate Agreement (BAA)</h1>
          <p className="mt-3 text-sm text-emerald-50/95 leading-relaxed">
            Contract-ready draft for legal review. Replace bracketed placeholders during redline.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Drafting Placeholders</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            [COVERED_ENTITY_NAME], [EFFECTIVE_DATE], [BREACH_NOTICE_WINDOW_DAYS], [CURE_PERIOD_DAYS], [GOVERNING_STATE], [VENUE_COUNTY_STATE]
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold">10. Signature Blocks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold">Covered Entity</p>
              <p>Name: [AUTHORIZED_SIGNER_NAME]</p>
              <p>Title: [AUTHORIZED_SIGNER_TITLE]</p>
              <p>Signature: ________________________</p>
              <p>Date: ________________________</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold">Business Associate (NyxCitadel, Inc.)</p>
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
