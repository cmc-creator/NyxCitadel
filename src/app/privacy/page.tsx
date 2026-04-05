import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#060b16] text-white">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-800/8 rounded-full blur-[100px]" />
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 py-14">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 mb-5">
            <Lock className="w-3 h-3" />
            Legal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
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

        <section className="mt-8 rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6">
          <h2 className="text-lg font-bold text-white">10. Contact</h2>
          <p className="mt-3 text-slate-300 leading-relaxed">
            For privacy or security questions, contact us at{' '}
            <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors" href="mailto:privacy@nyxcitadel.com">
              privacy@nyxcitadel.com
            </a>{' '}
            or{' '}
            <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors" href="mailto:sales@nyxcitadel.com">
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
