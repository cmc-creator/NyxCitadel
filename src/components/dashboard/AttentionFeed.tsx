import Link from 'next/link';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export interface AttentionItem {
  id: string;
  href: string;
  label: string;       // e.g. "CAP-0042 — Fall Risk Mitigation"
  sublabel: string;    // e.g. "Target date was Mar 15"
  urgency: 'critical' | 'high' | 'medium';
  category: string;    // e.g. "CAP" | "Grievance" | "IR/IAD"
}

const urgencyConfig = {
  critical: { dot: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-50 border-red-200',   label: 'Overdue' },
  high:     { dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: 'Due Soon' },
  medium:   { dot: 'bg-amber-400',  text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200',  label: 'This Week' },
};

function relativeDate(d: Date | string | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isPast(date)) return `${formatDistanceToNow(date)} overdue`;
  if (isToday(date)) return 'due today';
  if (isTomorrow(date)) return 'due tomorrow';
  return `due ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export function AttentionFeed({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-foreground">What Needs Attention Today</h3>
        </div>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-foreground/80">All caught up</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">No overdue or urgent items right now.</p>
        </div>
      </div>
    );
  }

  const critical = items.filter(i => i.urgency === 'critical');
  const high     = items.filter(i => i.urgency === 'high');
  const medium   = items.filter(i => i.urgency === 'medium');

  const groups = [
    { urgency: 'critical' as const, items: critical },
    { urgency: 'high'     as const, items: high },
    { urgency: 'medium'   as const, items: medium },
  ].filter(g => g.items.length > 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-teal-400" />
        <h3 className="text-sm font-semibold text-foreground">What Needs Attention Today</h3>
        <span className="ml-auto text-xs text-muted-foreground/60">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {groups.map(({ urgency, items: groupItems }) => {
          const cfg = urgencyConfig[urgency];
          return (
            <div key={urgency}>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${cfg.text}`}>
                {cfg.label} ({groupItems.length})
              </p>
              <div className="space-y-1.5">
                {groupItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:opacity-80 transition-opacity ${cfg.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                      <p className={`text-[11px] ${cfg.text} opacity-80`}>{item.sublabel}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 mr-1">{item.category}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function buildAttentionItems(data: {
  overdueCaps: { id: string; capNumber: string; title: string; targetDate: Date }[];
  overdueGrievances: { id: string; grievanceNumber: string; chiefComplaint: string; resolutionDueDate: Date; acknowledgmentDueDate: Date; acknowledgmentDate: Date | null; resolutionDate: Date | null }[];
  overdueAdhs: { id: string; reportNumber: string; incidentType: string; adhsReportDue: Date | null }[];
  pendingIad: { id: string; reportNumber: string; incidentType: string }[];
  overdueQoc: { id: string; cmsComplaintNumber: string | null; complainantName: string | null; responseDueDate: Date | null }[];
  dueSoonCaps: { id: string; capNumber: string; title: string; targetDate: Date }[];
}): AttentionItem[] {
  const now = new Date();
  const items: AttentionItem[] = [];

  // Critical: overdue CAPs
  for (const cap of data.overdueCaps) {
    items.push({
      id: `cap-${cap.id}`,
      href: `/trackers/caps/${cap.id}`,
      label: `${cap.capNumber} \u2014 ${cap.title}`,
      sublabel: relativeDate(cap.targetDate),
      urgency: 'critical',
      category: 'CAP',
    });
  }

  // Critical: overdue grievance acknowledgments
  for (const g of data.overdueGrievances) {
    const ackOverdue = !g.acknowledgmentDate && isPast(g.acknowledgmentDueDate);
    const resOverdue = !g.resolutionDate && isPast(g.resolutionDueDate);
    if (ackOverdue) {
      items.push({
        id: `griev-ack-${g.id}`,
        href: `/trackers/grievances/${g.id}`,
        label: `${g.grievanceNumber} \u2014 ${g.chiefComplaint.slice(0, 60)}`,
        sublabel: `Acknowledgment ${relativeDate(g.acknowledgmentDueDate)} \u00b7 CMS 7-day rule`,
        urgency: 'critical',
        category: 'Grievance',
      });
    } else if (resOverdue) {
      items.push({
        id: `griev-res-${g.id}`,
        href: `/trackers/grievances/${g.id}`,
        label: `${g.grievanceNumber} \u2014 ${g.chiefComplaint.slice(0, 60)}`,
        sublabel: `Resolution ${relativeDate(g.resolutionDueDate)} \u00b7 CMS 30-day rule`,
        urgency: 'critical',
        category: 'Grievance',
      });
    }
  }

  // Critical: overdue ADHS reports
  for (const ir of data.overdueAdhs) {
    items.push({
      id: `adhs-${ir.id}`,
      href: `/trackers/ir-iad/${ir.id}`,
      label: `${ir.reportNumber} \u2014 ${ir.incidentType.replace(/_/g, ' ')}`,
      sublabel: `ADHS report ${ir.adhsReportDue ? relativeDate(ir.adhsReportDue) : 'overdue'} \u00b7 ARS 36-2402`,
      urgency: 'critical',
      category: 'IR/IAD',
    });
  }

  // Critical: overdue QOC responses
  for (const qoc of data.overdueQoc) {
    items.push({
      id: `qoc-${qoc.id}`,
      href: `/trackers/qoc/${qoc.id}`,
      label: qoc.cmsComplaintNumber ?? `QOC \u2014 ${qoc.complainantName ?? 'Unnamed'}`,
      sublabel: `Response ${qoc.responseDueDate ? relativeDate(qoc.responseDueDate) : 'overdue'} \u00b7 CMS 10-day window`,
      urgency: 'critical',
      category: 'QOC',
    });
  }

  // High: pending IAD submissions
  for (const ir of data.pendingIad) {
    items.push({
      id: `iad-${ir.id}`,
      href: `/trackers/ir-iad/${ir.id}`,
      label: `${ir.reportNumber} \u2014 ${ir.incidentType.replace(/_/g, ' ')}`,
      sublabel: 'IAD submission pending \u00b7 file with ADHS',
      urgency: 'high',
      category: 'IR/IAD',
    });
  }

  // Medium: CAPs due within 7 days
  for (const cap of data.dueSoonCaps) {
    if (!isPast(cap.targetDate)) {
      items.push({
        id: `cap-soon-${cap.id}`,
        href: `/trackers/caps/${cap.id}`,
        label: `${cap.capNumber} \u2014 ${cap.title}`,
        sublabel: relativeDate(cap.targetDate),
        urgency: 'medium',
        category: 'CAP',
      });
    }
  }

  void now;

  // Deduplicate by id, cap at 20
  const seen = new Set<string>();
  return items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; }).slice(0, 20);
}
