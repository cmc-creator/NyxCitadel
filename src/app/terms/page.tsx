import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for NyxCitadel platform and services.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using NyxCitadel services, you agree to these Terms of Service and any applicable order forms, data processing terms, and policies incorporated by reference.',
  },
  {
    title: '2. Service Access and Eligibility',
    body: 'You must be authorized by your organization to use the service. You are responsible for maintaining accurate account information and protecting account credentials.',
  },
  {
    title: '3. Permitted Use',
    body: 'You may use the service only for lawful business purposes related to healthcare operations, compliance, risk, and quality management. You may not attempt to disrupt service integrity, bypass controls, or reverse engineer the platform except as permitted by law.',
  },
  {
    title: '4. Customer Responsibilities',
    body: 'Customers are responsible for user management, role-based access approvals, data accuracy, and compliance with applicable laws and regulations. Customer administrators are responsible for actions taken under their accounts.',
  },
  {
    title: '5. Fees and Billing',
    body: 'Subscription fees, billing schedules, renewal terms, and any implementation fees are defined in the applicable order form or agreement. Fees are non-refundable except as required by law or stated in writing.',
  },
  {
    title: '6. Confidentiality and Data Protection',
    body: 'Each party will protect confidential information using reasonable safeguards. Where applicable, a Business Associate Agreement and data protection terms govern PHI and regulated data handling.',
  },
  {
    title: '7. Intellectual Property',
    body: 'NyxCitadel retains all rights, title, and interest in the platform and related materials. Customers retain ownership of their submitted data. Feedback may be used to improve the service without obligation.',
  },
  {
    title: '8. Warranties and Disclaimer',
    body: 'The service is provided on an as-available basis subject to applicable agreements. Except as expressly stated in a signed agreement, NyxCollective disclaims implied warranties to the fullest extent allowed by law.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the maximum extent permitted by law, neither party is liable for indirect, consequential, special, or punitive damages. Aggregate liability is limited as set forth in the governing agreement.',
  },
  {
    title: '10. Termination',
    body: 'Either party may terminate for material breach if not cured within a reasonable period after notice, or as otherwise provided in contract terms. Upon termination, access may be suspended and data handling will follow the governing agreement.',
  },
  {
    title: '11. Governing Law',
    body: 'These terms are governed by applicable law and venue specified in the applicable commercial agreement, unless otherwise required by law.',
  },
  {
    title: '12. Changes to Terms',
    body: 'We may update these terms periodically. Material updates will be reflected by an updated effective date and additional notice when appropriate.',
  },
];

export default function TermsPage() {
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
            <FileText className="w-3 h-3" />
            Legal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Effective Date: March 31, 2026
          </p>
          <p className="mt-2 text-slate-400 leading-relaxed">
            These terms govern access to the NyxCitadel website and platform services.
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
          <h2 className="text-lg font-bold text-white">Contact</h2>
          <p className="mt-3 text-slate-300 leading-relaxed">
            Questions about these terms can be sent to{' '}
            <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors" href="mailto:legal@nyxcitadel.com">
              legal@nyxcitadel.com
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
          <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
