import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Plus, BookOpen, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'QOC Response Templates' };

const CATEGORY_LABELS: Record<string, string> = {
  PATIENT_GRIEVANCE_ACKNOWLEDGMENT: 'Grievance Acknowledgment',
  PATIENT_GRIEVANCE_RESOLUTION:     'Grievance Resolution',
  SENTINEL_EVENT_FAMILY_NOTICE:     'Sentinel Event Notice',
  PLAN_OF_CORRECTION:               'Plan of Correction',
  CAP_COMPLETION_NOTICE:            'CAP Completion Notice',
  INCIDENT_FAMILY_NOTIFICATION:     'Incident Family Notice',
  STATE_ADVERSE_EVENT_REPORT:       'AZ ADHS Adverse Event',
  JC_SENTINEL_EVENT_REPORT:         'JC Sentinel Event Report',
  SURVEY_RESPONSE_COVER:            'Survey Response',
  REGULATORY_INQUIRY_RESPONSE:      'Regulatory Inquiry',
  COMPLAINT_ACKNOWLEDGMENT:         'Complaint Acknowledgment',
  PATIENT_RIGHTS_VIOLATION_RESPONSE:'Patient Rights Response',
  EMPLOYEE_SAFETY_INCIDENT:         'Employee Safety Incident',
  OTHER:                            'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  PATIENT_GRIEVANCE_ACKNOWLEDGMENT: 'bg-blue-100 text-blue-700',
  PATIENT_GRIEVANCE_RESOLUTION:     'bg-green-100 text-green-700',
  SENTINEL_EVENT_FAMILY_NOTICE:     'bg-red-100 text-red-700',
  STATE_ADVERSE_EVENT_REPORT:       'bg-orange-100 text-orange-700',
  JC_SENTINEL_EVENT_REPORT:         'bg-red-100 text-red-700',
  PLAN_OF_CORRECTION:               'bg-purple-100 text-purple-700',
  OTHER:                            'bg-slate-100 text-slate-600',
};

export default async function ResponseTemplatesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const templates = await prisma.responseTemplate.findMany({
    where: { facilityId, isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  // Group by category
  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    const key = CATEGORY_LABELS[t.category] ?? t.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            QOC Response Templates
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Standardized response templates for grievances, adverse events, regulatory inquiries, and survey responses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quality/responses/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Generate Response
          </Link>
          <Link
            href="/quality/response-templates/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Template
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{templates.length}</div>
          <div className="text-sm text-slate-500">Active Templates</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {templates.filter(t => t.isDefault).length}
          </div>
          <div className="text-sm text-slate-500">System Defaults</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(grouped).length}
          </div>
          <div className="text-sm text-slate-500">Categories</div>
        </div>
      </div>

      {/* Regulatory Reminders */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">CMS / Regulatory Deadlines</p>
        <div className="flex flex-wrap gap-4 text-xs text-blue-800">
          <span><strong>7 days</strong> — Patient Grievance Acknowledgment (42 CFR 482.13(e))</span>
          <span><strong>30 days</strong> — Patient Grievance Resolution (42 CFR 482.13(e))</span>
          <span><strong>24 hours</strong> — Sentinel Event Family Notification (JC)</span>
          <span><strong>24 hours</strong> — AZ ADHS Adverse Event (R9-10-211)</span>
        </div>
      </div>

      {/* Templates grouped by category */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No templates yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first template or run the seeder to load defaults.</p>
          <Link
            href="/quality/response-templates/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Template
          </Link>
        </div>
      ) : (
        (Object.entries(grouped) as [string, typeof templates][]).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-slate-800 text-sm leading-snug">{t.name}</span>
                    {t.isDefault && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">Default</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[t.category] ?? 'bg-slate-100 text-slate-600'}`}>
                      {CATEGORY_LABELS[t.category] ?? t.category}
                    </span>
                    {t.daysRequired && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.daysRequired} days
                      </span>
                    )}
                    {t.regulatoryRef && (
                      <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">{t.regulatoryRef}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/quality/responses/new?templateId=${t.id}`}
                      className="flex-1 text-center text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Use Template
                    </Link>
                    <Link
                      href={`/quality/response-templates/${t.id}`}
                      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Link to generated responses */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800 text-sm">Generated Responses</p>
          <p className="text-xs text-slate-500">View all drafted, approved, and sent responses</p>
        </div>
        <Link
          href="/quality/responses"
          className="text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          View All →
        </Link>
      </div>
    </div>
  );
}
