import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, AlertOctagon, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SentinelPackageBuilder } from '@/components/reporting/sentinel-package-builder';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'JC Sentinel Event Disclosure' };

export default async function JcSentinelPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  // Pull incidents flagged as JC-reportable within the last 12 months
  const sentinelIncidents = await prisma.incidentReport.findMany({
    where: {
      facilityId,
      jcReportable: true,
      incidentDate: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { incidentDate: 'desc' },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/reporting" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reporting
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-red-400" />
          JC Sentinel Event Disclosure
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Build the Joint Commission sentinel event self-disclosure package. Events must be self-reported within 45 days of RCA completion.
        </p>
      </div>

      {/* Regulatory guidance callout */}
      <div className="bg-red-950/20 border border-red-800 rounded-xl p-4 text-sm text-red-300 space-y-1">
        <p className="font-semibold">Sentinel Event Policy Reminders</p>
        <ul className="list-disc list-inside text-xs text-red-300/80 space-y-0.5">
          <li>Root Cause Analysis must be completed within 45 days of the event or of becoming aware of it.</li>
          <li>The RCA action plan must be implemented and monitored for effectiveness.</li>
          <li>Self-report to JC via the Sentinel Event Reporting Form on their portal.</li>
          <li>JC may conduct a review following receipt of the disclosure.</li>
        </ul>
        <a
          href="https://www.jointcommission.org/resources/sentinel-event/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 mt-1"
        >
          JC Sentinel Event Policy <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* JC-reportable incidents */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            JC-Reportable Incidents (Last 12 Months) — {sentinelIncidents.length}
          </h2>
        </div>

        {sentinelIncidents.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No JC-reportable incidents in the past 12 months.{' '}
            <Link href="/incidents" className="text-teal-400 hover:underline">Mark incidents as JC-reportable</Link> in the incident tracker.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sentinelIncidents.map(incident => (
              <div key={incident.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">
                  {incident.briefDescription.slice(0, 80)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatDate(incident.incidentDate)} &middot;{' '}
                  {incident.incidentType} &middot;{' '}
                  Severity: {incident.severity}
                  </div>
                </div>
                <Link href={`/incidents/${incident.id}`} className="text-teal-400 hover:text-teal-300 text-xs flex-shrink-0">
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package builder */}
      <SentinelPackageBuilder incidents={sentinelIncidents.map(i => ({
        id: i.id,
        title: i.briefDescription.slice(0, 80),
        incidentDate: i.incidentDate.toISOString(),
        eventCategory: i.incidentType,
        severity: i.severity,
      }))} />
    </div>
  );
}
