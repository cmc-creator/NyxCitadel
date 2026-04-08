import Link from 'next/link';
import { FileText, ImageIcon, Video, Link as LinkIcon, Clock3, ShieldCheck } from 'lucide-react';
import DeleteAttachmentButton from './DeleteAttachmentButton';

type AttachmentItem = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  category: string | null;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  isEvidence: boolean;
};

function iconForKind(kind: string) {
  switch (kind) {
    case 'IMAGE':
      return ImageIcon;
    case 'VIDEO':
      return Video;
    case 'LINK':
      return LinkIcon;
    default:
      return FileText;
  }
}

export default function AttachmentPanel({
  title,
  emptyLabel,
  attachments,
}: {
  title: string;
  emptyLabel: string;
  attachments: AttachmentItem[];
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-slate-500">{attachments.length} item{attachments.length === 1 ? '' : 's'}</span>
      </div>
      {attachments.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground/70 text-center">{emptyLabel}</div>
      ) : (
        <div className="divide-y divide-border/30">
          {attachments.map((attachment) => {
            const Icon = iconForKind(attachment.kind);
            const isImage = attachment.kind === 'IMAGE';
            const isVideo = attachment.kind === 'VIDEO';
            const isPdf = attachment.kind === 'PDF';
            return (
              <div key={attachment.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-foreground truncate">{attachment.title}</p>
                    {attachment.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {attachment.category.replace(/_/g, ' ')}
                      </span>
                    )}
                    {attachment.isEvidence && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="w-3 h-3" /> Evidence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{attachment.fileName}</p>
                  {attachment.description && (
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{attachment.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" /> {attachment.createdAt.toLocaleDateString()}</span>
                    {attachment.uploadedBy && <span>Uploaded by {attachment.uploadedBy}</span>}
                  </div>

                  {isImage && (
                    <div className="mt-3">
                      <img
                        src={attachment.thumbnailUrl || attachment.fileUrl}
                        alt={attachment.title}
                        className="max-h-44 rounded-lg border border-border object-contain bg-slate-50"
                      />
                    </div>
                  )}

                  {isVideo && (
                    <div className="mt-3">
                      <video
                        controls
                        className="max-h-44 rounded-lg border border-border bg-black/90"
                        src={attachment.fileUrl}
                      />
                    </div>
                  )}

                  {isPdf && (
                    <div className="mt-3">
                      <iframe
                        src={attachment.fileUrl}
                        title={attachment.title}
                        className="w-full h-56 rounded-lg border border-border bg-white"
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Link href={attachment.fileUrl} target="_blank" className="text-xs font-medium text-teal-600 hover:text-teal-700">
                    Open
                  </Link>
                  <DeleteAttachmentButton id={attachment.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}