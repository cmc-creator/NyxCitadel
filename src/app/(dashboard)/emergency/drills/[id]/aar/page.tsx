import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  Flag,
  Shield,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export default async function DrillAARPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const [drill, facility] = await Promise.all([
    prisma.drill.findFirst({
      where: { id: params.id, facilityId },
      include: {
        drillActions: { orderBy: { timestamp: 'asc' } },
      },
    }),
    prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true, city: true, state: true } }),
  ]);

  if (!drill) notFound();

  // Mark AAR as generated if not yet
  if (!drill.aarGeneratedAt) {
    await prisma.drill.update({
      where: { id: drill.id },
      data: { aarGeneratedAt: new Date(), status: 'COMPLETED' },
    });
  }

  const issues       = drill.drillActions.filter((a) => a.issueFlag);
  const allClears    = drill.drillActions.filter((a) => a.actionType === 'ALL_CLEAR');
  const notifications = drill.drillActions.filter((a) => a.actionType === 'NOTIFICATION');
  const evacuations  = drill.drillActions.filter((a) => a.actionType === 'EVACUATION');

  // Elapsed compute
  const first = drill.drillActions[0]?.timestamp;
  const last  = drill.drillActions[drill.drillActions.length - 1]?.timestamp;
  const elapsedMin = first && last
    ? Math.round((new Date(last).getTime() - new Date(first).getTime()) / 60000)
    : null;

  const generatedDate = drill.aarGeneratedAt ?? new Date();

  return (
    <div className="space-y-6">
      {/* Nav + Print Button */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/emergency/drills/${drill.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Drill
        </Link>
        <PrintButton />
      </div>

      {/* ─── PRINTABLE REPORT ─────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-8 print:border-0 print:shadow-none print:p-0">

        {/* Cover */}
        <div className="border-b border-border pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-teal-600" />
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">NyxCitadel</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">After-Action Report (AAR)</h1>
              <p className="text-muted-foreground mt-1">{drill.drillName}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{drill.drillType.replace(/_/g, ' ')} - {facility?.name ?? ''}, {facility?.city}, {facility?.state}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-0.5">
              <p>Report Generated: {formatDate(generatedDate)}</p>
              <p>Drill Date: {formatDate(drill.conductedDate ?? drill.scheduledDate)}</p>
              {drill.observer && <p>Observer: {drill.observer}</p>}
              <p className="text-xs text-muted-foreground/70">CONFIDENTIAL - FOR INTERNAL QI USE</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <Section title="Executive Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryBox label="Status" value={drill.status.replace(/_/g, ' ')} />
            <SummaryBox label="Participants" value={drill.participantCount ? String(drill.participantCount) : 'N/A'} />
            <SummaryBox label="Actions Logged" value={String(drill.drillActions.length)} />
            <SummaryBox label="Issues Flagged" value={String(issues.length)} highlight={issues.length > 0} />
            {elapsedMin !== null && (
              <SummaryBox label="Elapsed Time" value={`${elapsedMin} min`} />
            )}
            <SummaryBox label="Evacuations" value={String(evacuations.length)} />
            <SummaryBox label="Notifications" value={String(notifications.length)} />
            <SummaryBox label="All-Clears" value={String(allClears.length)} />
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold">Location: </span>{drill.location ?? 'Not specified'}
            </div>
            <div>
              <span className="font-semibold">Regulatory Reference: </span>
              {drill.standardRef ?? drill.regulatoryBody ?? 'JC EM.03.01.03 / EC.02.02.01'}
            </div>
          </div>
        </Section>

        {/* Objectives & Scenario */}
        {(drill.objectives || drill.scenario) && (
          <Section title="Drill Objectives & Scenario">
            {drill.objectives && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Objectives</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{drill.objectives}</p>
              </div>
            )}
            {drill.scenario && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scenario Description</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{drill.scenario}</p>
              </div>
            )}
          </Section>
        )}

        {/* Full Timeline */}
        <Section title="Drill Timeline">
          {drill.drillActions.length === 0 ? (
            <p className="text-sm text-muted-foreground/70">No actions were logged during this drill.</p>
          ) : (
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 text-left w-28">Time</th>
                  <th className="py-2 text-left w-36">Actor</th>
                  <th className="py-2 text-left w-36">Type</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center w-16">Issue</th>
                </tr>
              </thead>
              <tbody>
                {drill.drillActions.map((a) => (
                  <tr key={a.id} className={`border-b border-border/30 ${a.issueFlag ? 'bg-red-950/20' : ''}`}>
                    <td className="py-2 text-muted-foreground text-xs">
                      {new Date(a.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 text-foreground/80 text-xs">{a.actor}</td>
                    <td className="py-2 text-muted-foreground text-xs">{a.actionType.replace(/_/g, ' ')}</td>
                    <td className="py-2 text-foreground">
                      {a.description}
                      {a.outcomeNotes && <span className="block text-xs text-muted-foreground italic">{a.outcomeNotes}</span>}
                    </td>
                    <td className="py-2 text-center">
                      {a.issueFlag && <Flag className="w-3.5 h-3.5 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Issues & Deficiencies */}
        <Section title="Issues & Deficiencies">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4" /> No issues were flagged during this drill. Excellent performance.
            </div>
          ) : (
            <ol className="space-y-3">
              {issues.map((issue, i) => (
                <li key={issue.id} className="border border-red-200 bg-red-950/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-700">Issue #{i + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(issue.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {issue.actor}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{issue.description}</p>
                  {issue.outcomeNotes && (
                    <p className="text-xs text-muted-foreground mt-1">Note: {issue.outcomeNotes}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Strengths Observed">
            {drill.strengths ? (
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{drill.strengths}</p>
            ) : (
              <p className="text-sm text-muted-foreground/70 italic">No strengths recorded. Edit this drill to add observations.</p>
            )}
          </Section>
          <Section title="Areas for Improvement">
            {drill.improvements ? (
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{drill.improvements}</p>
            ) : (
              <p className="text-sm text-muted-foreground/70 italic">No improvements recorded. Edit this drill to add observations.</p>
            )}
          </Section>
        </div>

        {/* Corrective Actions */}
        <Section title="Required Corrective Actions">
          {issues.length === 0 ? (
            <p className="text-sm text-emerald-700">No corrective actions required.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                The following items require a Corrective Action Plan (CAP) based on issues identified:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/80">
                {issues.map((issue, i) => (
                  <li key={issue.id}>
                    <span className="font-medium">Issue #{i + 1}:</span> {issue.description}
                    {drill.correctionsDue && (
                      <span className="text-xs text-muted-foreground ml-2">(Due: {formatDate(drill.correctionsDue)})</span>
                    )}
                  </li>
                ))}
              </ol>
              <Link
                href="/trackers/caps/new"
                className="mt-3 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline print:hidden"
              >
                → Create CAP in NyxCitadel
              </Link>
            </>
          )}
        </Section>

        {/* Signature Block */}
        <Section title="Attestation">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {['Drill Observer / Evaluator', 'Department Director', 'Compliance Officer'].map((role) => (
              <div key={role} className="space-y-4">
                <div className="border-b border-border pb-1">
                  <p className="text-xs text-muted-foreground">&nbsp;</p>
                </div>
                <p className="text-xs text-muted-foreground">{role}</p>
                <div className="border-b border-border pb-1">
                  <p className="text-xs text-muted-foreground">&nbsp;</p>
                </div>
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-border/30 pt-4 text-xs text-muted-foreground/70 flex items-center justify-between">
          <span>Generated by NyxCitadel · {facility?.name}</span>
          <span>JC EM.03.01.03 / EC.02.02.01 · {formatDate(generatedDate)}</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wide border-b border-border pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'bg-orange-950/20 border-orange-200' : 'bg-slate-50 border-border'}`}>
      <p className={`text-lg font-bold ${highlight ? 'text-orange-700' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
