import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Users2 , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import AttachmentPanel from '@/components/ui/AttachmentPanel';
import AttachmentComposer from '@/components/ui/AttachmentComposer';

export const dynamic = 'force-dynamic';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5 mb-3">{value}</dd>
    </>
  );
}

export default async function CommitteeMeetingDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [meeting, attachments] = await Promise.all([
    prisma.committeeMeeting.findUnique({ where: { id: params.id } }),
    prisma.attachment.findMany({
      where: {
        facilityId: session.user.facilityId,
        sourceType: 'COMMITTEE_MEETING',
        sourceId: params.id,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!meeting || meeting.facilityId !== session.user.facilityId) notFound();

  const actionItems = (meeting.actionItems ?? []) as Array<{ item: string; owner: string; dueDate?: string; status?: string }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/governance/committees" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Committee Meetings
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/governance/committees/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/governance/committees/${params.id}`} redirectPath="/governance/committees" label="committee meeting" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start gap-3">
          <Users2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{meeting.committeeType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {formatDate(meeting.meetingDate)} &middot; Chair: <strong>{meeting.chair}</strong>
              &middot; Quorum: <span className={meeting.quorumMet ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {meeting.quorumMet ? 'Met' : 'Not Met'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {meeting.agendaItems.length > 0 && (
            <Section title="Agenda Items">
              <ol className="space-y-2 list-decimal list-inside">
                {meeting.agendaItems.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80">{item}</li>
                ))}
              </ol>
            </Section>
          )}

          {actionItems.length > 0 && (
            <Section title="Action Items">
              <div className="space-y-3">
                {actionItems.map((ai, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 border border-slate-100 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ai.item}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">Owner: {ai.owner}
                        {ai.dueDate && <> &middot; Due: {ai.dueDate}</>}
                      </p>
                    </div>
                    {ai.status && (
                      <span className="shrink-0 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">{ai.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {meeting.reportReferences.length > 0 && (
            <Section title="Reports Reviewed">
              <div className="flex flex-wrap gap-2">
                {meeting.reportReferences.map((r, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-foreground/80 rounded-full px-3 py-1">{r}</span>
                ))}
              </div>
            </Section>
          )}

          {meeting.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{meeting.notes}</p>
            </Section>
          )}

          <AttachmentPanel
            title="Meeting Minutes & Attachments"
            attachments={attachments}
            emptyLabel="No signed minutes, exhibits, or supporting materials have been attached yet."
          />

          <AttachmentComposer
            sourceType="COMMITTEE_MEETING"
            sourceId={meeting.id}
            sourceLabel={`${meeting.committeeType.replace(/_/g, ' ')} — ${meeting.meetingDate.toLocaleDateString()}`}
            title="Add Meeting Attachment"
          />
        </div>

        <div className="space-y-5">
          <Section title="Meeting Details">
            <dl className="space-y-3">
              <Field label="Committee" value={meeting.committeeType.replace(/_/g, ' ')} />
              <Field label="Date" value={formatDate(meeting.meetingDate)} />
              <Field label="Chair" value={meeting.chair} />
              {meeting.nextMeetingDate && <Field label="Next Meeting" value={formatDate(meeting.nextMeetingDate)} />}
              {meeting.minutesApprovedDate && <Field label="Minutes Approved" value={formatDate(meeting.minutesApprovedDate)} />}
            </dl>
          </Section>

          {meeting.attendees.length > 0 && (
            <Section title={`Attendees (${meeting.attendees.length})`}>
              <ul className="space-y-1">
                {meeting.attendees.map((a, i) => <li key={i} className="text-sm text-foreground/80">{a}</li>)}
              </ul>
            </Section>
          )}

          {meeting.absentees.length > 0 && (
            <Section title="Absent">
              <ul className="space-y-1">
                {meeting.absentees.map((a, i) => <li key={i} className="text-sm text-muted-foreground/70">{a}</li>)}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
