import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `RCA ${params.id.slice(0, 8).toUpperCase()}` };
}

const STATUS_STYLES: Record<string, string> = {
  IN_PROGRESS:    'bg-yellow-100 text-yellow-800',
  DRAFT_COMPLETE: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW:   'bg-indigo-100 text-indigo-800',
  APPROVED:       'bg-emerald-100 text-emerald-800',
  SUBMITTED_TO_JC:'bg-purple-100 text-purple-800',
  CLOSED:         'bg-slate-100 text-slate-600',
};

function Section({ title, content }: { title: string; content?: string | null }) {
  if (!content) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}

export default async function RcaDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const rca = await prisma.rootCauseAnalysis.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!rca) notFound();

  // Parse JSON fields safely
  const whyAnalysis   = rca.whyAnalysis   ? (rca.whyAnalysis as Array<{ why: string; answer: string }>) : [];
  const rootCauses    = rca.rootCauses    ? (rca.rootCauses as string[]) : [];
  const actionItems   = rca.actionItems   ? (rca.actionItems as Array<{ action: string; responsible: string; targetDate?: string; status?: string }>) : [];

  const systemFlags = [
    rca.systemChangesRequired && 'System Changes Required',
    rca.policyChangesRequired && 'Policy Changes Required',
    rca.trainingRequired       && 'Training Required',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/trackers/rca" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to RCAs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-600" />
            {rca.rcaNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {rca.eventType} · {formatDate(rca.eventDate)}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full self-start ${STATUS_STYLES[rca.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {rca.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meta */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Details
            </h2>
            <dl className="space-y-3">
              {rca.conductedDate && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Conducted</dt>
                  <dd className="text-sm text-slate-900">{formatDate(rca.conductedDate)}</dd>
                </div>
              )}
              {rca.completedBy && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Completed By</dt>
                  <dd className="text-sm text-slate-900">{rca.completedBy}</dd>
                </div>
              )}
              {rca.approvedBy && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Approved By</dt>
                  <dd className="text-sm text-slate-900">{rca.approvedBy}</dd>
                </div>
              )}
              {rca.preventabilityRating && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Preventability</dt>
                  <dd className="text-sm text-slate-900">{rca.preventabilityRating}</dd>
                </div>
              )}
            </dl>
          </div>

          {rca.teamMembers && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-400" /> RCA Team
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{rca.teamMembers}</p>
            </div>
          )}

          {systemFlags.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h2 className="text-sm font-semibold text-amber-800 mb-2">Required Follow-Up</h2>
              <ul className="space-y-1">
                {systemFlags.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
            <Link
              href={`/trackers/caps/new?fromRca=${rca.id}&title=${encodeURIComponent(`CAP: ${rca.eventType}`)}&source=INCIDENT&desc=${encodeURIComponent((rca.conclusion ?? '').slice(0, 200))}`}
              className="block text-center text-xs font-medium bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Create CAP from RCA
            </Link>
          </div>
        </div>

        {/* Right: Analysis sections */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Event Description" content={rca.eventDescription} />
          <Section title="Event Timeline" content={rca.eventTimeline} />
          <Section title="Human Factors" content={rca.humanFactors} />
          <Section title="Equipment Factors" content={rca.equipmentFactors} />
          <Section title="Environment Factors" content={rca.environmentFactors} />
          <Section title="Process Factors" content={rca.processFactors} />
          <Section title="Organizational Factors" content={rca.organizationalFactors} />

          {/* 5-Whys */}
          {whyAnalysis.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">5-Whys Analysis</h3>
              <ol className="space-y-3">
                {whyAnalysis.map((w, i) => (
                  <li key={i} className="pl-4 border-l-2 border-purple-200">
                    <p className="text-xs font-semibold text-purple-700">Why #{i + 1}: {w.why}</p>
                    <p className="text-sm text-slate-700 mt-0.5">{w.answer}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Root causes */}
          {rootCauses.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Identified Root Causes</h3>
              <ul className="space-y-2">
                {rootCauses.map((rc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">•</span> {rc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action items */}
          {actionItems.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Action Items</h3>
              <div className="space-y-3">
                {actionItems.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm text-slate-900">{item.action}</p>
                      {item.responsible && <p className="text-xs text-slate-500 mt-0.5">Responsible: {item.responsible}</p>}
                      {item.targetDate && <p className="text-xs text-slate-500">Target: {formatDate(new Date(item.targetDate))}</p>}
                    </div>
                    {item.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Section title="Conclusion" content={rca.conclusion} />
          <Section title="Notes" content={rca.notes} />

          <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Created {formatDate(rca.createdAt)}</span>
            <span>Last updated {formatDate(rca.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
