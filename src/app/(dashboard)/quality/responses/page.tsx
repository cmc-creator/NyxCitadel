import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Plus, Clock, Send, CheckCircle2, FileEdit } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Generated Responses' };

const STATUS_COLORS: Record<string, string> = {
  DRAFT:        'bg-muted/30 text-muted-foreground',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED:     'bg-blue-100 text-blue-700',
  SENT:         'bg-green-100 text-green-700',
  FILED:        'bg-teal-100 text-teal-700',
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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Generated Responses
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All drafted, approved, and sent correspondence.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quality/response-templates"
            className="text-sm font-medium bg-muted/30 hover:bg-slate-200 text-foreground/80 px-3 py-2 rounded-lg transition-colors"
          >
            Templates
          </Link>
          <Link
            href="/quality/responses/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Response
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-muted-foreground">{draft.length}</div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-yellow-600">{review.length}</div>
          <div className="text-sm text-muted-foreground">Under Review</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-green-600">{sent.length}</div>
          <div className="text-sm text-muted-foreground">Sent</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdue.length > 0 ? 'bg-red-950/20 border-red-200' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${overdue.length > 0 ? 'text-red-600' : 'text-foreground'}`}>{overdue.length}</div>
          <div className="text-sm text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Table */}
      {responses.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No responses generated yet</p>
          <Link
            href="/quality/response-templates"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Browse Templates
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Template</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Due / Sent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {responses.map(r => {
                const StatusIcon = STATUS_ICONS[r.status] ?? FileEdit;
                const isOverdue = r.dueDate && r.dueDate < new Date() && r.status !== 'SENT' && r.status !== 'FILED';
                return (
                  <tr key={r.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{r.title}</div>
                      {r.aiGenerated && <span className="text-xs text-teal-500">✦ AI drafted</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.template?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      {r.recipientName && <div className="text-foreground/80">{r.recipientName}</div>}
                      {r.recipientRole && <div className="text-xs text-muted-foreground">{r.recipientRole}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                        <StatusIcon className="w-3 h-3" />{r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.sentDate ? (
                        <span className="text-green-600">Sent {formatDate(r.sentDate)}</span>
                      ) : r.dueDate ? (
                        <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                          {isOverdue ? '⚠ OVERDUE' : 'Due'} {formatDate(r.dueDate)}
                        </span>
                      ) : <span className="text-muted-foreground/70">-</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/quality/responses/${r.id}`} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
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
