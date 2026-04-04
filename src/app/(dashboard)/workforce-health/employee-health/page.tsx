import { HeartHandshake, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EmployeeHealthPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();

  const records = await prisma.employeeHealthRecord.findMany({
    where: { facilityId },
    orderBy: { tbNextDueDate: 'asc' },
  });

  const tbOverdue = records.filter(r => r.tbNextDueDate && r.tbNextDueDate < now).length;
  const fluVaxGiven = records.filter(r => r.fluVaxDate).length;
  const fluDeclined = records.filter(r => r.fluVaxDeclined).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Employee Health</h1>
          </div>
          <p className="text-muted-foreground/70 text-sm">TB screening, flu vaccination status, and occupational exposure tracking.</p>
        </div>
        <a href="/workforce-health/employee-health/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Record
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: records.length, color: 'text-blue-400' },
          { label: 'TB Screening Overdue', value: tbOverdue, color: tbOverdue > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Flu Vax Given', value: fluVaxGiven, color: 'text-emerald-400' },
          { label: 'Flu Vax Declined', value: fluDeclined, color: fluDeclined > 0 ? 'text-amber-400' : 'text-muted-foreground/70' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {tbOverdue > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{tbOverdue} employee(s) have overdue TB screenings.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground/70 text-xs">
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">TB Screen Date</th>
              <th className="text-left px-4 py-3">TB Result</th>
              <th className="text-left px-4 py-3">TB Next Due</th>
              <th className="text-left px-4 py-3">Flu Vax</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No employee health records on file.</td></tr>
            ) : records.map(r => {
              const tbPast = r.tbNextDueDate && r.tbNextDueDate < now;
              return (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{r.employeeName}</td>
                  <td className="px-4 py-3 text-muted-foreground/70">{r.department ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{r.tbScreenDate?.toLocaleDateString() ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground/70">{r.tbResult ?? '-'}</td>
                  <td className={`px-4 py-3 ${tbPast ? 'text-red-400 font-medium' : 'text-slate-300'}`}>{r.tbNextDueDate?.toLocaleDateString() ?? '-'}</td>
                  <td className="px-4 py-3">
                    {r.fluVaxDeclined
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Declined</span>
                      : r.fluVaxDate
                        ? <div className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3.5 h-3.5" />{r.fluVaxDate.toLocaleDateString()}</div>
                        : <span className="text-slate-500 text-xs">Not recorded</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
