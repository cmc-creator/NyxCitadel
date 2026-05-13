import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AdhsExportButton } from '@/components/reporting/adhs-export-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ADHS IR/IAD Reporting' };

export default async function AdhsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  // Pull IAD-required incidents from the last 90 days
  const incidents = await prisma.incidentReport.findMany({
    where: {
      facilityId,
      iadRequired: true,
      incidentDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { incidentDate: 'desc' },
  });

  // JC-reportable incidents
  const jcReportable = incidents.filter((i) => i.jcReportable);

  // Recent ADHS submissions
  const submissions = await prisma.regulatorySubmission.findMany({
    where: { facilityId, submissionType: 'ADHS_IR_IAD' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/reporting" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reporting
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          ADHS Incident / IAD Reporting
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Incidents flagged as IAD-required from the last 90 days. Export a formatted submission package for the Arizona ADHS portal.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">IAD-Required (90 days)</p>
          <p className="text-2xl font-bold text-orange-400">{incidents.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Also JC-Reportable</p>
          <p className="text-2xl font-bold text-red-400">{jcReportable.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Past ADHS Submissions</p>
          <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
        </div>
      </div>

      {/* Incidents to report */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">IAD-Required Incidents (Last 90 Days)</h2>
          <div className="flex gap-2">
            <Link
              href="/incidents"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View All Incidents
            </Link>
            <AdhsExportButton incidents={incidents.map(i => ({
              id: i.id,
              title: i.briefDescription.slice(0, 80),
              incidentDate: i.incidentDate.toISOString(),
              eventCategory: i.incidentType,
              jcReportable: i.jcReportable,
              severity: i.severity,
            }))} />
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No IAD-required incidents in the past 90 days.{' '}
            <Link href="/incidents" className="text-teal-400 hover:underline">View all incidents</Link> to flag them.
          </div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-slate-900/40">
                <th className="text-left p-3 text-slate-400 font-medium">Incident</th>
                <th className="text-left p-3 text-slate-400 font-medium">Date</th>
                <th className="text-left p-3 text-slate-400 font-medium">Category</th>
                <th className="text-left p-3 text-slate-400 font-medium">Severity</th>
                <th className="text-left p-3 text-slate-400 font-medium">JC?</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident, i) => (
                <tr key={incident.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                  <td className="p-3 font-medium text-foreground">
                    {incident.briefDescription.slice(0, 60)}
                  </td>
                  <td className="p-3 text-slate-400">
                    {formatDate(incident.incidentDate)}
                  </td>
                  <td className="p-3 text-slate-400">
                    {incident.incidentType}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium ${
                      incident.severity === 'SENTINEL' ? 'text-red-400' :
                      incident.severity === 'SERIOUS' ? 'text-orange-400' : 'text-slate-400'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    {incident.jcReportable && (
                      <span className="text-xs bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">JC</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/incidents/${incident.id}`} className="text-teal-400 hover:text-teal-300 text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Previous submissions */}
      {submissions.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Previous ADHS Submissions</h2>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-slate-900/40">
                <th className="text-left p-3 text-slate-400 font-medium">Period</th>
                <th className="text-left p-3 text-slate-400 font-medium">Submitted</th>
                <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                <th className="text-left p-3 text-slate-400 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={s.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                  <td className="p-3 text-slate-400">{s.reportingPeriod}</td>
                  <td className="p-3 text-slate-400">{s.submittedDate ? formatDate(s.submittedDate) : '—'}</td>
                  <td className="p-3 text-slate-400">{s.status}</td>
                  <td className="p-3 text-slate-400">{s.portalReference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        ⓘ Submit exported files directly to the{' '}
        <a href="https://azdhs.gov/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
          Arizona ADHS portal
        </a>. Incidents must be reported within 5 calendar days per A.A.C. R9-10-1006.
      </div>
    </div>
  );
}
