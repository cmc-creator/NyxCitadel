'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Loader2 } from 'lucide-react';

interface Props {
  surveyId: string;
  surveyTitle: string;
  notMetCount: number;
}

export function BulkCreatePocsButton({ surveyId, surveyTitle, notMetCount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function handleCreate() {
    if (!confirm(`Create a Plan of Correction for all ${notMetCount} Not Met finding(s) in "${surveyTitle}"?`)) return;
    setLoading(true);
    try {
      // POST to create a POC linked to this mock survey
      const res = await fetch('/api/poc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Mock Survey Deficiencies - ${surveyTitle}`,
          regulatoryBody: 'ADHS',
          surveyId,
        }),
      });
      if (!res.ok) throw new Error('Failed to create POC');
      setDone(true);
      router.refresh();
    } catch {
      alert('Failed to create POC. Please create manually via Quality → Plans of Correction.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-green-400">
        <ClipboardCheck className="w-4 h-4" /> POC Created
      </span>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
      Create POC for All Findings
    </button>
  );
}
