import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Search , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { CommentThread } from '@/components/shared/CommentThread';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'DRAFT_COMPLETE', label: 'Draft Complete', color: 'bg-blue-100 text-blue-700' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-orange-100 text-orange-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'SUBMITTED_TO_JC', label: 'Submitted to JC', color: 'bg-purple-100 text-purple-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-muted/30 text-muted-foreground' },
];

interface WhyItem { why: string; answer: string }
interface ActionItem { action: string; responsible: string; targetDate: string; status: string }
interface RootCauseItem { cause: string; category?: string }

export default async function RcaDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const rca = await prisma.rootCauseAnalysis.findUnique({ where: { id: params.id } });
  if (!rca || rca.facilityId !== session.user.facilityId) notFound();

  const whyAnalysis = rca.whyAnalysis as WhyItem[] | null;
  const rootCauses = rca.rootCauses as (RootCauseItem | string)[] | null;
  const actionItems = rca.actionItems as ActionItem[] | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/rca" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to RCAs
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/rca/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Search className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-mono text-muted-foreground/70">{rca.rcaNumber}</span>
              <span className="text-xs bg-muted/30 text-muted-foreground rounded-full px-2.5 py-0.5">{rca.eventType}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground line-clamp-2">{rca.eventDescription}</h1>
            <p className="text-sm text-muted-foreground mt-1">Event date: <strong>{formatDate(rca.eventDate)}</strong></p>
          </div>
          <StatusUpdater apiPath={`/api/rca/${rca.id}`} currentStatus={rca.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {rca.eventTimeline && (
            <Section title="Event Timeline">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{rca.eventTimeline}</p>
            </Section>
          )}

          <Section title="Contributing Factors (JC LD.04.04.05)">
            <div className="space-y-3">
              {rca.humanFactors && <Factor label="Human Factors" content={rca.humanFactors} color="blue" />}
              {rca.equipmentFactors && <Factor label="Equipment / Technology" content={rca.equipmentFactors} color="orange" />}
              {rca.environmentFactors && <Factor label="Environment" content={rca.environmentFactors} color="green" />}
              {rca.processFactors && <Factor label="Process / Protocol" content={rca.processFactors} color="yellow" />}
              {rca.organizationalFactors && <Factor label="Organizational" content={rca.organizationalFactors} color="purple" />}
              {!rca.humanFactors && !rca.equipmentFactors && !rca.environmentFactors && !rca.processFactors && !rca.organizationalFactors && (
                <p className="text-sm text-muted-foreground/70 italic">No contributing factors recorded yet.</p>
              )}
            </div>
          </Section>

          {whyAnalysis && whyAnalysis.length > 0 && (
            <Section title="5-Why Analysis">
              <ol className="space-y-3">
                {whyAnalysis.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-none w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Why: <span className="font-normal text-foreground">{item.why}</span></p>
                      <p className="text-xs text-foreground/80 mt-0.5">Because: {item.answer}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {rootCauses && rootCauses.length > 0 && (
            <Section title="Root Causes Identified">
              <ul className="space-y-2">
                {rootCauses.map((rc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="text-teal-500 font-bold mt-0.5">&#x2022;</span>
                    <span>{typeof rc === 'string' ? rc : rc.cause}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {actionItems && actionItems.length > 0 && (
            <Section title="Action Items">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground/70 border-b border-border/30">
                      <th className="pb-2 pr-3">Action</th>
                      <th className="pb-2 pr-3">Responsible</th>
                      <th className="pb-2 pr-3">Target Date</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {actionItems.map((a, i) => (
                      <tr key={i} className="text-foreground/80">
                        <td className="py-2 pr-3">{a.action}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{a.responsible}</td>
                        <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{a.targetDate}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {rca.conclusion && (
            <Section title="Conclusion">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{rca.conclusion}</p>
              {rca.preventabilityRating && (
                <p className="mt-2 text-xs text-muted-foreground">Preventability: <span className="font-medium text-foreground">{rca.preventabilityRating}</span></p>
              )}
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="RCA Details">
            <dl className="space-y-2">
              <Row label="RCA #" value={rca.rcaNumber} />
              <Row label="Event Type" value={rca.eventType} />
              <Row label="Event Date" value={formatDate(rca.eventDate)} />
              {rca.conductedDate && <Row label="RCA Conducted" value={formatDate(rca.conductedDate)} />}
              {rca.completedBy && <Row label="Completed By" value={rca.completedBy} />}
              {rca.approvedBy && <Row label="Approved By" value={rca.approvedBy} />}
            </dl>
          </Section>

          <Section title="Required Changes">
            <dl className="space-y-2">
              <Row label="System Changes" value={rca.systemChangesRequired ? 'Required' : 'No'} highlight={rca.systemChangesRequired} />
              <Row label="Policy Changes" value={rca.policyChangesRequired ? 'Required' : 'No'} highlight={rca.policyChangesRequired} />
              <Row label="Training Required" value={rca.trainingRequired ? 'Yes' : 'No'} highlight={rca.trainingRequired} />
            </dl>
          </Section>

          {rca.teamMembers && (
            <Section title="RCA Team">
              <p className="text-xs text-foreground/80 whitespace-pre-wrap">{rca.teamMembers}</p>
            </Section>
          )}

          {rca.linkedIncidentId && (
            <Section title="Linked Incident">
              <Link href={`/trackers/incidents/${rca.linkedIncidentId}`} className="text-xs text-purple-700 hover:underline">&#x2192; View Incident</Link>
            </Section>
          )}
        </div>
      </div>

      <CommentThread
        recordType="RCA"
        recordId={rca.id}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}

function Factor({ label, content, color }: { label: string; content: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-950/20 border-blue-200',
    orange: 'bg-orange-950/20 border-orange-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-foreground/80 whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs text-muted-foreground shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right ${highlight ? 'text-red-600 font-bold' : 'text-foreground'}`}>{value}</dd>
    </div>
  );
}
