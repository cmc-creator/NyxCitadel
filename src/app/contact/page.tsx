import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, Clock3, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact NyxCitadel sales, legal, and support teams.',
};

const contacts = [
  {
    label: 'Sales',
    value: 'sales@nyxcitadel.com',
    href: 'mailto:sales@nyxcitadel.com',
    icon: Mail,
  },
  {
    label: 'Legal',
    value: 'legal@nyxcitadel.com',
    href: 'mailto:legal@nyxcitadel.com',
    icon: ShieldCheck,
  },
  {
    label: 'Support',
    value: 'support@nyxcitadel.com',
    href: 'mailto:support@nyxcitadel.com',
    icon: Mail,
  },
  {
    label: 'Main Line',
    value: '(602) 555-0100',
    href: 'tel:+16025550100',
    icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Contact</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Talk to NyxCitadel</h1>
        <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
          Reach out for pricing, contracting, security reviews, implementation planning, or support.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contacts.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-indigo-400/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <item.icon className="h-4 w-4 text-indigo-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-white">{item.value}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
          <div className="flex items-center gap-2 text-indigo-100 font-semibold">
            <Clock3 className="h-4 w-4" />
            Response Times
          </div>
          <ul className="mt-3 space-y-2 text-sm text-indigo-50/90">
            <li>Sales and procurement: within 1 business day</li>
            <li>Legal review intake: within 2 business days</li>
            <li>Support triage: same business day</li>
          </ul>
        </section>

        <div className="mt-10 flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">Back to Home</Link>
          <span className="text-slate-700">•</span>
          <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Request Access</Link>
        </div>
      </div>
    </div>
  );
}
