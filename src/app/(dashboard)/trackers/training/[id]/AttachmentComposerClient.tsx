'use client';

import AttachmentComposer from '@/components/ui/AttachmentComposer';

export default function AttachmentComposerClient({
  recordId,
  trainingName,
}: {
  recordId: string;
  trainingName: string;
}) {
  return (
    <AttachmentComposer
      sourceType="TRAINING_RECORD"
      sourceId={recordId}
      sourceLabel={trainingName}
      title="Add Training Evidence"
    />
  );
}