'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiFieldHelperProps {
  fieldLabel: string;
  pageContext: string;
  value: string;
  onChange: (text: string) => void;
  formHints?: Record<string, string>;
  rows?: number;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

export function AiFieldHelper({
  fieldLabel,
  pageContext,
  value,
  onChange,
  formHints = {},
  rows = 4,
  placeholder,
  name,
  required,
  className = '',
}: AiFieldHelperProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function assist(action: 'suggest' | 'improve') {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai-field-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldLabel,
          pageContext,
          formHints,
          existingText: action === 'improve' ? value : undefined,
          action,
        }),
      });

      const data = await res.json() as { suggestion?: string; error?: string };

      if (!res.ok || !data.suggestion) {
        setError(data.error ?? 'No suggestion returned.');
      } else {
        onChange(data.suggestion);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const hasText = value.trim().length > 0;

  return (
    <div>
      {/* Label row with sparkle button */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-slate-600">
          {fieldLabel}{required && ' *'}
        </label>
        <div className="flex items-center gap-1">
          {loading ? (
            <span className="flex items-center gap-1 text-xs text-teal-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sentry is writing&hellip;
            </span>
          ) : (
            <>
              {hasText && (
                <button
                  type="button"
                  onClick={() => assist('improve')}
                  className="text-xs text-slate-400 hover:text-teal-500 transition-colors px-1.5 py-0.5 rounded hover:bg-teal-950/20"
                  title="Sentry will improve your text"
                >
                  Improve
                </button>
              )}
              <button
                type="button"
                onClick={() => assist('suggest')}
                className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-400 transition-colors px-1.5 py-0.5 rounded hover:bg-teal-950/20"
                title={hasText ? 'Regenerate suggestion' : 'Let Sentry write this'}
              >
                <Sparkles className="w-3 h-3" />
                {hasText ? 'Regenerate' : 'Suggest'}
              </button>
            </>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        name={name}
        required={required}
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={loading}
        className={`form-input w-full disabled:opacity-60 ${className}`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
