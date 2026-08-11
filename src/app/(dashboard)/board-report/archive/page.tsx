import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Archive, ArrowLeft, FileBarChart, Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Board Report Archive' };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function ResilienceChip({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    B: 'bg-teal-950/40 text-teal-400 border-teal-800/40',
    C: 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40',
    D: 'bg-orange-950/40 text-orange-400 border-orange-800/40',
    F: 'bg-red-950/40 text-red-400 border-red-800/40',
  };
  return (
    <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${colors[grade] ?? 'bg-muted/30 text-muted-foreground border-border'}`}>
      {grade}
    </span>
  );
}

export default async function BoardReportArchivePage() {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return null;
  }

  const reports = await prisma.boardReport.findMany({
    where: { facilityId: session.user.facilityId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ reportYear: 'desc' }, { reportMonth: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/board-report"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Board Report
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Archive className="w-6 h-6 text-teal-400" />
            Board Report Archive
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Saved board compliance reports
          </p>
        </div>
        <Link
          href="/board-report"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FileBarChart className="w-4 h-4" />
          Generate New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground/70">
          <Archive className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="font-medium">No archived reports yet.</p>
          <p className="text-sm mt-1">
            Generate a board report and click &ldquo;Save to Archive&rdquo; to store it here.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Report</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Grade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Metrics</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Saved By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Saved At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {reports.map((report) => {
                const content = report.content as Record<string, unknown>;
                const grade = content?.resGrade as string | undefined;
                const trainingPct = content?.trainingPct as number | undefined;
                const capsOpen = content?.capsOpen as number | undefined;
                const irLast90 = content?.irLast90 as number | undefined;
                return (
                  <tr key={report.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileBarChart className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="font-medium text-foreground/90 text-sm">{report.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {MONTH_NAMES[(report.reportMonth - 1)] ?? report.reportMonth} {report.reportYear}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {grade ? <ResilienceChip grade={grade} /> : <span className="text-muted-foreground/50">-</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                        {trainingPct !== undefined && <span>Training: {trainingPct}%</span>}
                        {capsOpen !== undefined && <span>Open CAPs: {capsOpen}</span>}
                        {irLast90 !== undefined && <span>IRs (90d): {irLast90}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {report.user?.name ?? report.user?.email ?? 'System'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
