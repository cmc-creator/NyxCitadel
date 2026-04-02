import { FileText, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdvanceDirectivesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const records = await prisma.advanceDirectiveRecord.findMany({
    where: { facilityId },
    orderBy: { admitDate: 'desc' },
    take: 100,
  });

  const notOffered = records.filter(r => !r.informationProvided).length;
  const onFile     = records.filter(r => r.adOnFile).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Advance Directives</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS §482.13(b)(3)</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Advance directive status per admission — documentation of existence, type, and information offered at intake.</p>
        </div>
        <a href="/patient-rights/advance-directives/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Update Record
        </a>
      </div>

      {notOffered > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{notOffered} patient(s) did not receive advance directive information at admission — required under CMS CoP. Complete documentation immediately.</p>
        </div>
      )}

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
        <strong className="text-blue-300">CMS §482.13(b)(3) Requirement:</strong> Hospitals must ask each patient at admission whether they have an advance directive. If the patient does not have one, the hospital must provide written information explaining their rights to create one.
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'ADs on File',            value: `${onFile}/${records.length}`, color: 'text-emerald-400' },
          { label: 'Info Offered at Admit',  value: records.filter(r => r.informationProvided).length, color: 'text-blue-400' },
          { label: 'Info NOT Offered',       value: notOffered,  color: notOffered > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Patient', 'Admit Date', 'AD Exists?', 'Type', 'On File?', 'Info Offered?', 'Declined?'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-500 text-sm">No advance directive records on file.</td></tr>
            ) : records.map(p => (
              <tr key={p.id} className={`hover:bg-white/5 transition-colors ${!p.informationProvided ? 'bg-red-500/5' : ''}`}>
                <td className="px-4 py-3 font-bold text-white">{p.patientInitials}</td>
                <td className="px-4 py-3 text-muted-foreground/70 text-xs">{p.admitDate.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {p.adExists ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-slate-500">No</span>}
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">{p.adType ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.adOnFile ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-slate-500">—</span>}
                </td>
                <td className="px-4 py-3">
                  {p.informationProvided
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <AlertTriangle className="w-4 h-4 text-red-400" />}
                </td>
                <td className="px-4 py-3">
                  {p.patientDeclined ? <span className="text-xs text-amber-400">Declined</span> : <span className="text-xs text-slate-500">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
