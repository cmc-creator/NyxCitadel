import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Delete Your Account | NyxCitadel',
  description: 'How to request deletion of your NyxCitadel account, what data is deleted or kept, and how long deletion takes.',
  openGraph: {
    title: 'Delete Your NyxCitadel Account',
    description: 'Steps to request account deletion, what data is deleted or kept, and retention timing.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Delete Your NyxCitadel Account' },
};

const sections = [
  {
    title: '1. What Is Deleted',
    body: 'Your user account and personal profile data - your name, email address, login credentials, and preferences - are permanently deleted.',
  },
  {
    title: '2. What Is Kept, and Why',
    body: 'Compliance records you created or edited as part of your facility\'s work (incidents, policies, corrective action plans, comments, and similar records) remain in your facility\'s records, because they are the facility\'s compliance documentation and may be subject to legal and accreditation retention requirements. Where practical, your name on retained records is replaced with a removed-user label. Audit log entries are retained as required by law and contract.',
  },
  {
    title: '3. Backups',
    body: 'Deleted account data is removed from backups within 90 days.',
  },
  {
    title: '4. Facility Accounts',
    body: 'A facility owner closing the facility\'s NyxCitadel service should contact info@nyxcollectivellc.com. Facility data export and deletion are handled under the facility\'s agreement.',
  },
];

export default function DeleteAccountPage() {
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
            className="h-10 w-auto rounded-lg flex-shrink-0 drop-shadow-[0_0_12px_rgba(154,123,45,0.45)]"
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
            <Trash2 className="w-3 h-3" />
            Your Account
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Delete your NyxCitadel account</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            NyxCitadel accounts belong to a facility and are created by facility administrators. There are two ways to have an account deleted:
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
          <h2 className="text-lg font-bold text-white">How to request deletion</h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-slate-300 leading-relaxed">
            <li>
              <span className="font-semibold text-white">Ask your facility administrator:</span> an administrator for your facility can deactivate or delete your user account from Settings, Users.
            </li>
            <li>
              <span className="font-semibold text-white">Email us:</span> send a request to{' '}
              <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors" href="mailto:info@nyxcollectivellc.com">
                info@nyxcollectivellc.com
              </a>{' '}
              from the email address on your account, with the subject &quot;Delete my account&quot;. We verify the request with your facility administrator and complete it within 30 days.
            </li>
          </ol>
        </section>

        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">Back to Home</Link>
          <span className="text-slate-700">•</span>
          <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          NyxCitadel™ • © 2026 Nyx Collective LLC •{' '}
          <a className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors" href="https://nyxcollectivellc.com">
            nyxcollectivellc.com
          </a>
        </p>
      </div>
    </div>
  );
}
