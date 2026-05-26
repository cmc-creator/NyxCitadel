'use client';

import { useState } from 'react';
import { Download, FileText, TrendingUp, AlertTriangle, CheckCircle, Users, BookOpen, FileBarChart2, ShieldOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  fileType?: 'csv' | 'pdf';
  color: 'purple' | 'blue' | 'red' | 'green' | 'orange' | 'indigo';
  category: 'Compliance' | 'Incidents' | 'Training' | 'Drills' | 'Policies' | 'RCA' | 'Executive';
}

const EXPORTS: ExportItem[] = [
  {
    id: 'caps',
    title: 'Corrective Action Plans',
    description: 'All CAPs with status, priority, target dates, and assignees. Use for board reports and regulatory submissions.',
    icon: <CheckCircle className="w-5 h-5" />,
    endpoint: '/api/export/caps',
    color: 'purple',
    category: 'Compliance',
  },
  {
    id: 'incidents',
    title: 'Incidents',
    description: 'Complete incident log with types, severity, location, and state report status. Essential for risk management.',
    icon: <AlertTriangle className="w-5 h-5" />,
    endpoint: '/api/export/incidents',
    color: 'red',
    category: 'Incidents',
  },
  {
    id: 'rcas',
    title: 'Root Cause Analyses',
    description: 'RCA investigations with root causes, corrective actions, and completion status. For quality improvement documentation.',
    icon: <TrendingUp className="w-5 h-5" />,
    endpoint: '/api/export/rcas',
    color: 'orange',
    category: 'RCA',
  },
  {
    id: 'training',
    title: 'Training Records',
    description: 'Staff training completion status, expiry dates, and compliance gaps. For workforce management and audits.',
    icon: <Users className="w-5 h-5" />,
    endpoint: '/api/export/training',
    color: 'green',
    category: 'Training',
  },
  {
    id: 'drills',
    title: 'Emergency Drills',
    description: 'Fire drills, tabletops, and full-scale exercises with participation and observer notes. For emergency preparedness compliance.',
    icon: <BookOpen className="w-5 h-5" />,
    endpoint: '/api/export/drills',
    color: 'indigo',
    category: 'Drills',
  },
  {
    id: 'policies',
    title: 'Policies & Procedures',
    description: 'All facility policies with review dates, versions, and status. For governance and policy management.',
    icon: <FileText className="w-5 h-5" />,
    endpoint: '/api/export/policies',
    color: 'blue',
    category: 'Policies',
  },
  {
    id: 'training-lockouts',
    title: 'Scheduling Lockouts',
    description: 'Staff currently blocked from scheduling due to overdue required training. Includes department, block date, reason, and any active HR overrides.',
    icon: <ShieldOff className="w-5 h-5" />,
    endpoint: '/api/export/training/lockouts',
    color: 'red',
    category: 'Training',
  },
  {
    id: 'board-report-pdf',
    title: 'Board PDF Report',
    description: 'Board-ready PDF snapshot with resilience score, risk indicators, and executive highlights for leadership packets.',
    icon: <FileBarChart2 className="w-5 h-5" />,
    endpoint: '/api/export/board-report/pdf',
    fileType: 'pdf',
    color: 'indigo',
    category: 'Executive',
  },
];

const REPORT_PACKS = [
  {
    id: 'board-packet',
    title: 'Board Packet',
    description: 'Board PDF plus the core datasets leadership typically requests for monthly governance review.',
    endpoints: ['/api/export/board-report/pdf', '/api/export/caps', '/api/export/incidents', '/api/export/rcas', '/api/export/policies'],
  },
  {
    id: 'survey-pack',
    title: 'Survey Readiness Pack',
    description: 'Policies, training, drills, CAPs, and incidents bundled for accreditation or state-survey preparation.',
    endpoints: ['/api/export/policies', '/api/export/training', '/api/export/drills', '/api/export/caps', '/api/export/incidents'],
  },
] as const;

const colorClasses = {
  purple: { bg: 'bg-teal-950/20 border-teal-200 hover:bg-teal-100', text: 'text-teal-600' },
  blue: { bg: 'bg-blue-950/20 border-blue-200 hover:bg-blue-100', text: 'text-blue-600' },
  red: { bg: 'bg-red-950/20 border-red-200 hover:bg-red-100', text: 'text-red-600' },
  green: { bg: 'bg-green-50 border-green-200 hover:bg-green-100', text: 'text-green-600' },
  orange: { bg: 'bg-orange-950/20 border-orange-200 hover:bg-orange-100', text: 'text-orange-600' },
  indigo: { bg: 'bg-teal-950/20 border-indigo-200 hover:bg-indigo-100', text: 'text-teal-600' },
};

const badgeClasses = {
  purple: 'bg-teal-100 text-teal-800',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadEndpoint(endpoint: string) {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disposition = response.headers.get('content-disposition');
    const filenameMatch = disposition?.match(/filename="?([^";]+)"?/i);
    a.download = filenameMatch?.[1] ?? endpoint.split('/').pop()?.split('?')[0] ?? 'export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  const handleDownload = async (endpoint: string, id: string) => {
    setDownloading(id);
    try {
      await downloadEndpoint(endpoint);
      toast({ title: 'Export Ready', description: 'Your file download has started.' });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Download failed.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const handlePackDownload = async (packId: string, endpoints: readonly string[]) => {
    setDownloading(packId);
    try {
      for (const endpoint of endpoints) {
        await downloadEndpoint(endpoint);
      }
      toast({ title: 'Report Pack Started', description: `Started ${endpoints.length} downloads for this packet.` });
    } catch (error) {
      toast({
        title: 'Report Pack Failed',
        description: error instanceof Error ? error.message : 'Could not start all downloads.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const categories = Array.from(new Set(EXPORTS.map(e => e.category)));
  const groupedByCategory = categories.reduce((acc, cat) => {
    acc[cat] = EXPORTS.filter(e => e.category === cat);
    return acc;
  }, {} as Record<string, ExportItem[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Export Center</h1>
        <p className="text-gray-400 mt-2">Download compliance data for reports, audits, and stakeholder communication</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-2xl font-bold text-white">{EXPORTS.length}</div>
          <div className="text-sm text-gray-400">Export Reports</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-2xl font-bold text-teal-400">CSV</div>
          <div className="text-sm text-gray-400">Format</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-2xl font-bold text-green-400">Ready</div>
          <div className="text-sm text-gray-400">Live</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {REPORT_PACKS.map((pack) => (
          <div key={pack.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Saved Packet</p>
              <h2 className="text-xl font-semibold text-white mt-1">{pack.title}</h2>
              <p className="text-sm text-gray-400 mt-2">{pack.description}</p>
            </div>
            <p className="text-xs text-gray-500">Includes {pack.endpoints.length} files.</p>
            <button
              onClick={() => void handlePackDownload(pack.id, pack.endpoints)}
              disabled={downloading === pack.id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white text-sm font-medium rounded transition-colors"
            >
              <Download className="w-4 h-4" />
              {downloading === pack.id ? 'Preparing Packet...' : 'Download Packet'}
            </button>
          </div>
        ))}
      </div>

      {/* Export Cards by Category */}
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-white mb-4">{category}</h2>
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-6 transition-all ${colorClasses[item.color].bg}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 text-2xl opacity-75 ${colorClasses[item.color].text}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${badgeClasses[item.color]} whitespace-nowrap`}>
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDownload(item.endpoint, item.id)}
                  disabled={downloading === item.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white text-sm font-medium rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {downloading === item.id ? 'Downloading...' : `Download ${item.fileType === 'pdf' ? 'PDF' : 'CSV'}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Usage Tips */}
      <div className="bg-card border-2 border-dashed border-border rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">💡 Usage Tips</h3>
        <div className="text-gray-300 space-y-2 text-sm">
          <p>• <strong>Board Reports:</strong> Use the Board Packet for one-click leadership downloads, including the trend-enabled board PDF.</p>
          <p>• <strong>Accreditation Surveys:</strong> Use the Survey Readiness Pack for evidence-heavy meetings and tracer prep.</p>
          <p>• <strong>Risk Assessment:</strong> Combine incidents and RCAs to identify patterns before committee review.</p>
          <p>• <strong>State Reporting:</strong> Export incidents with reportable status for regulatory submissions.</p>
          <p>• <strong>Audit Preparation:</strong> Schedule external delivery lists so executive recipients receive the right cadence automatically.</p>
        </div>
      </div>
    </div>
  );
}
