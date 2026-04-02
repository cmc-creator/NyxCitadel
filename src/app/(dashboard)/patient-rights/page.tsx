import Link from 'next/link';
import { HeartHandshake, ChevronRight, CheckCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const rightsChecklist = [
  { right: 'Right to be informed of rights at admission',               required: 'Admission',                   status: true  },
  { right: 'Right to informed consent prior to treatment',              required: 'Before start of treatment',   status: true  },
  { right: 'Right to refuse treatment',                                  required: 'Ongoing',                     status: true  },
  { right: 'Right to access personal records',                           required: 'On request (within 30 days)', status: true  },
  { right: 'Right to file a grievance',                                  required: 'At admission and on request', status: true  },
  { right: 'Notice of Privacy Practices provided',                       required: 'At admission',                status: true  },
  { right: 'Advance Directive status inquired and documented',           required: 'At admission',                status: true  },
  { right: 'Right to legal representation (involuntary patients)',       required: 'Upon hold initiation',        status: true  },
  { right: 'Right to be free from unnecessary restraint',               required: 'Ongoing',                     status: true  },
  { right: 'Right to interpreter services',                              required: 'On need',                     status: false },
];

export default async function PatientRightsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const [activeConsents, activeHolds] = await Promise.all([
    prisma.consentRecord.count({ where: { facilityId, status: { in: ['SIGNED', 'VERBAL'] } } }),
    prisma.involuntaryHoldLog.count({ where: { facilityId, status: 'ACTIVE' } }),
  ]);

  const gaps = rightsChecklist.filter(r => !r.status).length;

  const subModules = [
    {
      href: '/patient-rights/consents',
      title: 'Consent Records',
      description: 'Informed consent tracking - treatment, medication, procedures, ECT. Capacity determination documented.',
      icon: 'Pen', badge: 'CMS §482.13', badgeColor: 'bg-blue-100 text-blue-700',
      stat: `${activeConsents} Active Consents`, statColor: 'text-blue-400',
    },
    {
      href: '/patient-rights/advance-directives',
      title: 'Advance Directives',
      description: 'AD status per encounter - existence, type, on file, and information offered per CMS CoP.',
      icon: 'Clipboard', badge: 'CMS §482.13(b)(3)', badgeColor: 'bg-emerald-100 text-emerald-700',
      stat: 'AD tracking per admission', statColor: 'text-emerald-400',
    },
    {
      href: '/patient-rights/holds',
      title: 'Involuntary Holds',
      description: 'Title 36 / 72-hour holds, court orders, legal counsel notification, and hearing dates.',
      icon: 'Scale', badge: 'ARS Title 36', badgeColor: 'bg-red-100 text-red-700',
      stat: `${activeHolds} Active Holds`, statColor: activeHolds > 0 ? 'text-amber-400' : 'text-emerald-400',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeartHandshake className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold text-white">Patient Rights</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">CMS §482.13</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">ARS Title 36</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Informed consent, advance directives, MOON notices, and involuntary hold documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Consents',  value: activeConsents, icon: HeartHandshake, color: 'text-rose-400' },
          { label: 'Active Holds',     value: activeHolds,    icon: Shield,         color: 'text-amber-400' },
          { label: 'Rights Issues',    value: gaps,           icon: AlertTriangle,  color: gaps > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Consents Current', value: 'Yes',            icon: CheckCircle,    color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground/70">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
        <p className="text-sm font-semibold text-white mb-3">Patient Rights Program Compliance Checklist</p>
        <div className="space-y-2">
          {rightsChecklist.map(r => (
            <div key={r.right} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <div className="flex items-start gap-2">
                {r.status
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />}
                <p className={`text-xs ${r.status ? 'text-slate-300' : 'text-amber-300'}`}>{r.right}</p>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">{r.required}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-rose-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-rose-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground/70 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
