import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for NyxCitadel platform and services.',
};

const sections = [
  {
    title: '1. Scope',
    body: 'This Privacy Policy describes how NyxCollective LLC and NyxCitadel collect, use, and protect information when you visit our website, request a demo, or use our services.',
  },
  {
    title: '2. Information We Collect',
    body: 'We may collect business contact information, account profile details, service usage telemetry, support communications, and files or records submitted by authorized users. We collect only the information needed to operate, secure, and improve the service.',
  },
  {
    title: '3. How We Use Information',
    body: 'We use collected information to provide and secure the platform, respond to requests, deliver support, send service communications, and improve product quality and performance.',
  },
  {
    title: '4. Data Sharing',
    body: 'We do not sell personal information. We may share data with subprocessors that support hosting, storage, analytics, or communications under contractual obligations that require confidentiality and appropriate safeguards.',
  },
  {
    title: '5. Security Safeguards',
    body: 'NyxCitadel applies administrative, technical, and physical safeguards designed to protect data from unauthorized access, loss, misuse, or disclosure. No method of transmission or storage is guaranteed to be 100% secure.',
  },
  {
    title: '6. HIPAA and PHI',
    body: 'When required, we execute a Business Associate Agreement (BAA). Customer organizations remain responsible for determining permitted uses and disclosures of PHI and for configuring user access appropriately.',
  },
  {
    title: '7. Retention',
    body: 'We retain information for as long as necessary to provide services, meet legal obligations, resolve disputes, and enforce agreements. Customers may request export or deletion as allowed by contract and applicable law.',
  },
  {
    title: '8. Your Choices',
    body: 'You may request updates or corrections to business contact information, opt out of non-essential marketing messages, and submit privacy-related requests through the contact channels below.',
  },
  {
    title: '9. Policy Updates',
    body: 'We may update this policy periodically. Material changes will be reflected by an updated effective date and, when appropriate, additional notice.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Legal</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Effective Date: March 31, 2026
          </p>
          <p className="mt-2 text-slate-400 leading-relaxed">
            This policy applies to NyxCitadel public site and platform services.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
          <h2 className="text-lg font-bold text-indigo-100">10. Contact</h2>
          <p className="mt-3 text-indigo-50/90 leading-relaxed">
            For privacy or security questions, contact us at{' '}
            <a className="underline underline-offset-2" href="mailto:privacy@nyxcitadel.com">
              privacy@nyxcitadel.com
            </a>{' '}
            or{' '}
            <a className="underline underline-offset-2" href="mailto:sales@nyxcitadel.com">
              sales@nyxcitadel.com
            </a>.
          </p>
        </section>

        <div className="mt-10 flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">Back to Home</Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
