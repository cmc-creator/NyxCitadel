import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FileText, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata = { title: 'Documents' };

const CATEGORY_COLORS: Record<string, string> = {
  POLICY:      'bg-purple-100 text-purple-700',
  PROCEDURE:   'bg-blue-100 text-blue-700',
  FORM:        'bg-teal-100 text-teal-700',
  EM_PLAN:     'bg-orange-100 text-orange-700',
  TRAINING:    'bg-green-100 text-green-700',
  REGULATORY:  'bg-red-100 text-red-700',
  OTHER:       'bg-slate-100 text-slate-700',
};

export default async function DocumentsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const documents = await prisma.document.findMany({
    where: { facilityId },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Document Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Policies, procedures, emergency plans, training materials, and regulatory documents.
          </p>
        </div>
        <a
          href="/documents/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Upload Document
        </a>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No documents uploaded yet.</p>
            <a href="/documents/upload" className="mt-3 text-sm text-purple-600 hover:underline">
              Upload your first document
            </a>
          </div>
        ) : (
          <table className="data-table">
            <thead className="data-table-head">
              <tr>
                <th className="data-table-th">Document Name</th>
                <th className="data-table-th">Category</th>
                <th className="data-table-th">Uploaded By</th>
                <th className="data-table-th">Last Updated</th>
                <th className="data-table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.id} className="data-table-row">
                  <td className="data-table-td">
                    <Link href={`/documents/${doc.id}`} className="font-medium text-slate-900 hover:text-purple-700 transition-colors">{doc.name}</Link>
                    {doc.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
                    )}
                  </td>
                  <td className="data-table-td">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.OTHER)}>
                      {doc.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="data-table-td text-sm text-slate-600">{doc.uploadedBy ?? '—'}</td>
                  <td className="data-table-td text-sm text-slate-600">
                    {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="data-table-td">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
