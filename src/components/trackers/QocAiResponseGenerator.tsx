'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

interface QocAiResponseGeneratorProps {
  qocId: string;
  allegationSummary: string;
  findingsSummary?: string;
  qocNumber: string;
}

export function QocAiResponseGenerator({
  qocId,
  allegationSummary,
  findingsSummary,
  qocNumber,
}: QocAiResponseGeneratorProps) {
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [chartData, setChartData] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!investigationNotes.trim()) {
      setError('Please provide investigation notes');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/qoc-ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qocId,
          investigationNotes,
          chartData: chartData || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate response');
      }

      const data = await res.json();
      setResponse(data.formalResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-foreground">AI Response Generator</h3>
        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Sentry AI</span>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Paste your investigation findings and optional supporting data. Sentry AI will draft a formal CMS-ready response.
      </p>

      {!response ? (
        <div className="space-y-4">
          {/* Investigation Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Investigation Notes *</label>
            <textarea
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              placeholder="Summarize what you investigated, who you spoke with, what evidence you reviewed, and your findings..."
              className="w-full h-32 p-3 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Chart/Supporting Data */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Chart Data / Evidence (Optional)</label>
            <textarea
              value={chartData}
              onChange={(e) => setChartData(e.target.value)}
              placeholder="Paste any key metrics, chart data, screenshots, or other evidence supporting your findings..."
              className="w-full h-24 p-3 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !investigationNotes.trim()}
            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-muted/50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Formal Response'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Generated Response */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Generated Response</p>
            <div className="prose prose-sm max-w-none text-sm text-foreground whitespace-pre-wrap">
              {response}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Response
                </>
              )}
            </button>
            <button
              onClick={() => {
                setResponse(null);
                setInvestigationNotes('');
                setChartData('');
              }}
              className="flex-1 px-3 py-2 text-sm border border-border text-foreground rounded-lg font-medium hover:bg-muted/30 transition-colors"
            >
              Generate Again
            </button>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Review and edit the response as needed before submitting. All generated content should be reviewed for accuracy and tone.
          </p>
        </div>
      )}
    </div>
  );
}
