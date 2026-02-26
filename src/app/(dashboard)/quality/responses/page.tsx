import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Plus, Clock, Send, CheckCircle2, FileEdit } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Generated Responses' };

const STATUS_COLORS: Record<string, string> = {
  DRAFT:        'bg-slate-100 text-slate-600',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED:     'bg-blue-100 text-blue-700',
  SENT:         'bg-green-100 text-green-700',
  FILED:        'bg-purple-100 text-purple-700',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  DRAFT:        FileEdit,
  UNDER_REVIEW: Clock,
  APPROVED:     CheckCircle2,
  SENT:         Send,
  FILED:        CheckCircle2,
};

export default async function ResponsesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const responses = await prisma.generatedResponse.findMany({
    where: { facilityId },
    include: { template: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const draft     = responses.filter(r => r.status === 'DRAFT');
  const review    = responses.filter(r => r.status === 'UNDER_REVIEW');
  const sent      = responses.filter(r => r.status === 'SENT');
  const overdue   = responses.filter(r => r.dueDate && r.dueDate < new Date() && r.status !== 'SENT' && r.status !== 'FILED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Generated Responses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All drafted, approved, and sent correspondence.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quality/response-templates"
            className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
          >
            Templates
          </Link>
          <Link
            href="/quality/responses/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Response
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-600">{draft.length}</div>
          <div className="text-sm text-slate-500">Drafts</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{review.length}</div>
          <div className="text-sm text-slate-500">Under Review</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{sent.length}</div>
          <div className="text-sm text-slate-500">Sent</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdue.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdue.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{overdue.length}</div>
          <div className="text-sm text-slate-500">Overdue</div>
        </div>
      </div>

      {/* Table */}
      {responses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No responses generated yet</p>
          <Link
            href="/quality/response-templates"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Browse Templates
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Template</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due / Sent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {responses.map(r => {
                const StatusIcon = STATUS_ICONS[r.status] ?? FileEdit;
                const isOverdue = r.dueDate && r.dueDate < new Date() && r.status !== 'SENT' && r.status !== 'FILED';
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{r.title}</div>
                      {r.aiGenerated && <span className="text-xs text-purple-500">✦ AI drafted</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.template?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {r.recipientName && <div className="text-slate-700">{r.recipientName}</div>}
                      {r.recipientRole && <div className="text-xs text-slate-500">{r.recipientRole}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        <StatusIcon className="w-3 h-3" />{r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.sentDate ? (
                        <span className="text-green-600">Sent {formatDate(r.sentDate)}</span>
                      ) : r.dueDate ? (
                        <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                          {isOverdue ? '⚠ OVERDUE' : 'Due'} {formatDate(r.dueDate)}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/quality/responses/${r.id}`} className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                        View →
                      </Link>
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
