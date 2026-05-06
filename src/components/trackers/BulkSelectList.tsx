'use client';

import { useState, useCallback } from 'react';
import { CheckSquare, Square, X, Trash2, CheckCheck, Download } from 'lucide-react';

interface BulkSelectListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T, isSelected: boolean, onToggle: (id: string) => void) => React.ReactNode;
  bulkApiPath: string;
  closeLabel?: string;
  closeAction?: string;
  onSuccess?: () => void;
}

export function BulkSelectList<T extends { id: string }>({
  items,
  renderItem,
  bulkApiPath,
  closeLabel = 'Mark Closed',
  closeAction = 'close',
}: BulkSelectListProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  async function bulkAction(action: string) {
    setWorking(true);
    setFeedback('');
    try {
      const res = await fetch(bulkApiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === 'export') {
          // Download CSV blob
          const blob = new Blob([data.csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `export-${Date.now()}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          setFeedback(`${data.updated ?? selected.size} records updated.`);
          setSelected(new Set());
          // Refresh page data
          window.location.reload();
        }
      } else {
        setFeedback('Action failed. Please try again.');
      }
    } finally {
      setWorking(false);
      setConfirming(false);
    }
  }

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0;

  return (
    <div className="space-y-3">
      {/* Select all row */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            {allSelected ? <CheckSquare className="w-4 h-4 text-teal-500" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Deselect all' : `Select all (${items.length})`}
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {someSelected && (
        <div className="sticky top-2 z-10 flex items-center gap-2 bg-teal-900/90 backdrop-blur border border-teal-500/40 rounded-xl px-4 py-2.5 shadow-lg flex-wrap">
          <span className="text-sm font-medium text-teal-200">{selected.size} selected</span>
          <div className="flex-1" />
          {feedback && <span className="text-xs text-teal-300">{feedback}</span>}
          <button
            onClick={() => bulkAction('export')}
            disabled={working}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => bulkAction(closeAction)}
            disabled={working}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" /> {closeLabel}
          </button>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={working}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          ) : (
            <>
              <button
                onClick={() => bulkAction('delete')}
                disabled={working}
                className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Confirm Delete
              </button>
              <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1.5 text-muted-foreground/70 hover:text-foreground">
                Cancel
              </button>
            </>
          )}
          <button onClick={clearSelection} className="p-1 text-muted-foreground/50 hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className={`relative flex items-start gap-2 ${someSelected ? '' : ''}`}>
            <button
              onClick={() => toggle(item.id)}
              className="mt-1.5 flex-shrink-0 p-0.5 text-muted-foreground/50 hover:text-teal-500 transition-colors"
              aria-label="Select item"
            >
              {selected.has(item.id)
                ? <CheckSquare className="w-4 h-4 text-teal-500" />
                : <Square className="w-4 h-4" />
              }
            </button>
            <div className={`flex-1 min-w-0 transition-opacity ${selected.has(item.id) ? 'opacity-80' : ''}`}>
              {renderItem(item, selected.has(item.id), toggle)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
