'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Download, Tag, Calendar, AlertTriangle,
  User, HardDrive, ArrowLeft, Trash2, ExternalLink, Pencil,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import AttachmentPanel from '@/components/ui/AttachmentPanel';
import AttachmentComposer from '@/components/ui/AttachmentComposer';

interface DocumentRecord {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedBy?: string | null;
  expiryDate?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface AttachmentRecord {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  mimeType?: string | null;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSizeBytes?: number | null;
  durationSeconds?: number | null;
  sourceLabel?: string | null;
  category: string | null;
  tags: string[];
  isEvidence: boolean;
  isPublic: boolean;
  capturedAt?: string | null;
  uploadedBy: string | null;
  createdAt: Date;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function mimeLabel(mime: string | null | undefined): string {
  if (!mime) return 'Unknown';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('word') || mime.includes('docx')) return 'Word Document';
  if (mime.includes('sheet') || mime.includes('xlsx')) return 'Spreadsheet';
  if (mime.includes('png') || mime.includes('jpeg') || mime.includes('jpg')) return 'Image';
  return mime.split('/')[1]?.toUpperCase() ?? mime;
}

export default function DocumentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/documents/${id}`).then(r => r.json()),
      fetch(`/api/attachments?sourceType=DOCUMENT&sourceId=${id}`).then(r => r.json()),
    ])
      .then(([docData, attachmentData]) => {
        setDoc(docData);
        setAttachments(Array.isArray(attachmentData) ? attachmentData : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load document.');
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${doc?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.push('/documents');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-500">{error || 'Document not found.'}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-purple-600 hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
  const expiresWithin30 =
    doc.expiryDate &&
    !isExpired &&
    new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => router.push('/documents')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>
        <Link href={`/documents/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{doc.name}</h1>
              <span className="inline-block mt-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                {doc.category}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Open / Download
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Description */}
        {doc.description && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">{doc.description}</p>
        )}

        {/* Expiry warnings */}
        {isExpired && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              This document expired on {formatDate(new Date(doc.expiryDate!), 'MMM d, yyyy')}.
            </p>
          </div>
        )}
        {expiresWithin30 && (
          <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              Expires {formatDate(new Date(doc.expiryDate!), 'MMM d, yyyy')} - review soon.
            </p>
          </div>
        )}
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {
            icon: User,
            label: 'Uploaded by',
            value: doc.uploadedBy ?? 'Unknown',
          },
          {
            icon: Calendar,
            label: 'Uploaded',
            value: formatDate(new Date(doc.createdAt), 'MMM d, yyyy'),
          },
          {
            icon: Calendar,
            label: 'Last updated',
            value: formatDate(new Date(doc.updatedAt), 'MMM d, yyyy'),
          },
          {
            icon: Calendar,
            label: 'Expiry date',
            value: doc.expiryDate
              ? formatDate(new Date(doc.expiryDate), 'MMM d, yyyy')
              : 'No expiry',
          },
          {
            icon: HardDrive,
            label: 'File size',
            value: doc.fileSize ? formatBytes(doc.fileSize) : 'Unknown',
          },
          {
            icon: FileText,
            label: 'File type',
            value: mimeLabel(doc.mimeType),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <p className="text-sm font-medium text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {doc.tags.map(tag => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 text-xs font-medium rounded-full px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <AttachmentPanel
        title="Related Evidence & Media"
        attachments={attachments}
        emptyLabel="No related media or supporting evidence has been attached to this document yet."
      />

      <AttachmentComposer
        sourceType="DOCUMENT"
        sourceId={doc.id}
        sourceLabel={doc.name}
        title="Add Related Evidence"
      />

      {/* File link */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">File Location</p>
          <p className="text-xs text-slate-400 mt-0.5 break-all">{doc.fileUrl}</p>
        </div>
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open document file"
          title="Open document file"
          className="shrink-0 text-purple-600 hover:text-purple-800 transition"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
