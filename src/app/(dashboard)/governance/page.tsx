import Link from 'next/link';
import { Building2, ChevronRight, Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function GovernancePage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [committeeMeetings, overdueDocuments, expiringSoonDocs, upcomingMeetings] = await Promise.all([
    prisma.committeeMeeting.count({ where: { facilityId, meetingDate: { gte: yearStart } } }),
    prisma.governanceDocument.count({ where: { facilityId, reviewDate: { lt: now } } }),
    prisma.governanceDocument.count({ where: { facilityId, reviewDate: { gte: now, lte: in90 } } }),
    prisma.committeeMeeting.count({ where: { facilityId, meetingDate: { gte: now, lte: in30 } } }),
  ]);

  const overallCompliant = overdueDocuments === 0;

  const subModules = [
    { href: '/governance/committees', icon: Users, label: 'Committee Meetings', desc: 'Track quorum, minutes, and action items', color: 'text-violet-400' },
    { href: '/governance/documents', icon: FileText, label: 'Governance Documents', desc: 'Bylaws, policies, charters, and approvals', color: 'text-blue-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-5 h-5 text-violet-400" />
        <h1 className="text-xl font-bold text-white">Governance</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Committee Meetings YTD', value: committeeMeetings, color: 'text-violet-400' },
          { label: 'Upcoming Meetings (30d)', value: upcomingMeetings, color: 'text-blue-400' },
          { label: 'Documents Overdue Review', value: overdueDocuments, color: overdueDocuments > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Expiring Soon (90d)', value: expiringSoonDocs, color: expiringSoonDocs > 0 ? 'text-amber-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-4 flex items-center gap-3 ${overallCompliant ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
        {overallCompliant
          ? <><CheckCircle className="w-5 h-5 text-emerald-400" /><p className="text-sm text-emerald-300">All governance documents are current — no overdue reviews.</p></>
          : <><AlertTriangle className="w-5 h-5 text-amber-400" /><p className="text-sm text-amber-300">{overdueDocuments} governance document(s) require review. Address before next board meeting.</p></>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href} className="rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 p-5 flex items-center justify-between group transition-colors">
            <div className="flex items-center gap-3">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div>
                <p className="font-semibold text-white">{m.label}</p>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
