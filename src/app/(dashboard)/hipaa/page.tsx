import Link from 'next/link';
import { Lock, AlertTriangle, ChevronRight, CheckCircle, FileText, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HipaaPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [totalBaas, expiredBaas, expiringSoonBaas, openBreaches] = await Promise.all([
    prisma.baaTracker.count({ where: { facilityId } }),
    prisma.baaTracker.count({ where: { facilityId, expiryDate: { lt: now } } }),
    prisma.baaTracker.count({ where: { facilityId, status: 'ACTIVE', expiryDate: { gte: now, lte: in90 } } }),
    prisma.hipaaBreachLog.count({ where: { facilityId, status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } } }),
  ]);

  const subModules = [
    {
      href: '/hipaa/breaches',
      title: 'Breach Log',
      description: 'Privacy incidents and confirmed breaches - required under HIPAA §164.400 Breach Notification Rule.',
      icon: '🔐', badge: 'HIPAA §164.400', badgeColor: 'bg-red-100 text-red-700',
      stat: openBreaches > 0 ? `${openBreaches} Under Review` : 'No open breaches',
      statColor: openBreaches > 0 ? 'text-amber-400' : 'text-emerald-400',
    },
    {
      href: '/hipaa/baa',
      title: 'BAA Tracker',
      description: 'Business Associate Agreement tracking - all vendors with PHI access, expiry alerts, status.',
      icon: '📄', badge: 'HIPAA §164.308', badgeColor: 'bg-blue-100 text-blue-700',
      stat: `${totalBaas} Total BAAs`,
      statColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">HIPAA / Privacy Compliance</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">45 CFR Parts 160 &amp; 164</span>
          </div>
          <p className="text-slate-400 text-sm">Breach log, BAA management, risk assessment tracking, and Notice of Privacy Practices.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active BAAs',        value: totalBaas,       icon: FileText,      color: 'text-blue-400' },
          { label: 'BAAs Expiring <90d', value: expiringSoonBaas, icon: Clock,         color: 'text-amber-400' },
          { label: 'Open Breaches',      value: openBreaches,    icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Expired BAAs',       value: expiredBaas,     icon: CheckCircle,   color: expiredBaas > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">HIPAA Program Requirements</p>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            { item: 'Privacy Officer designated',                      status: true  },
            { item: 'Security Officer designated',                     status: true  },
            { item: 'Notice of Privacy Practices (NPP) current & posted', status: true  },
            { item: 'Annual HIPAA workforce training',                 status: true  },
            { item: 'Security Risk Assessment current (<1 year)',      status: true  },
            { item: 'BAA in place for all business associates',        status: expiredBaas === 0 },
            { item: 'Breach response procedures documented',           status: true  },
            { item: 'Mobile device encryption policy enforced',        status: false },
          ].map(r => (
            <div key={r.item} className="flex items-center gap-2 text-xs">
              {r.status
                ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              <span className={r.status ? 'text-slate-300' : 'text-amber-300'}>{r.item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-blue-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-400 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
