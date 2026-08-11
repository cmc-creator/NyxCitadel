import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HighAlertMedsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const audits = await prisma.highAlertMedAudit.findMany({
    where: { facilityId },
    orderBy: { auditDate: 'desc' },
    take: 50,
  });

  const actions = audits.filter(a => a.actionRequired).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">High-Alert Medication Audits</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">ISMP / TJC MM.01</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Storage, labeling, access restriction, and double-check compliance audits for ISMP high-alert medications.</p>
        </div>
        <a href="/pharmacy/high-alert/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Audit
        </a>
      </div>

      {actions > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{actions} audit(s) contain action-required findings. Address before end of shift.</p>
        </div>
      )}

      <div className="space-y-4">
        {audits.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-muted-foreground text-sm">No high-alert medication audits on record.</div>
        ) : audits.map(a => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.actionRequired ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-slate-800/50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">{a.medication}</p>
                  {a.actionRequired && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Action Required</span>}
                </div>
                <p className="text-xs text-muted-foreground/70">{a.unit} - {a.auditDate.toLocaleDateString()} - Auditor: {a.auditor}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs mt-2">
              {[
                { label: 'Storage Correct',  ok: a.storageCorrect },
                { label: 'Labeling Correct', ok: a.labelingCorrect },
                { label: 'Double-Check Done', ok: a.doubleCheckDone },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span className={item.ok ? 'text-slate-300' : 'text-amber-300'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
