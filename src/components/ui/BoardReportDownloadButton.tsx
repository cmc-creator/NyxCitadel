'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export function BoardReportDownloadButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch('/api/export/board-report/pdf');
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 print:hidden"
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
