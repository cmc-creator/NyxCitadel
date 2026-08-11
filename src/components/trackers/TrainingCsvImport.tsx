'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertTriangle, FileSpreadsheet, Download } from 'lucide-react';

type ParsedRow = Record<string, string>;

function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = splitCsvLine(l);
    const row: ParsedRow = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

const TEMPLATE_HEADERS = [
  'staffName','staffId','department','jobTitle','trainingName',
  'category','status','completedDate','expiryDate','isRequired',
  'score','passingScore','provider','notes',
].join(',');

const TEMPLATE_EXAMPLE = [
  'Jane Doe','EMP-001','Nursing','RN','Annual Mandatory Training',
  'ANNUAL_MANDATORY','COMPLETED','2024-01-15','2025-01-15','true',
  '95','80','Internal','2024 annual cohort',
].join(',');

function downloadTemplate() {
  const csv = `${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE}\n`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'training_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function TrainingCsvImport({ onImported }: { onImported?: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number; results: { index: number; ok: boolean; error?: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { alert('Please upload a .csv file'); return; }
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCsv(text);
      setHeaders(h);
      setRows(r);
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  async function doImport() {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/training/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
      if (data.created > 0 && onImported) onImported();
    } catch {
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setRows([]); setHeaders([]); setFileName(''); setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm bg-card border border-border hover:bg-muted/30 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <Upload className="w-3.5 h-3.5" /> Import CSV
      </button>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-foreground">Bulk Import Training Records</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            <Download className="w-3 h-3" /> Download template
          </button>
          <button onClick={() => { setOpen(false); reset(); }} className="p-1 hover:bg-muted/40 rounded">
            <X className="w-4 h-4 text-muted-foreground/60" />
          </button>
        </div>
      </div>

      {!result ? (
        <>
          {/* Drop zone */}
          {rows.length === 0 && (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-teal-500 bg-teal-950/20' : 'border-border hover:border-teal-700/60 hover:bg-muted/20'
              }`}
            >
              <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground/70">Drop a CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Required columns: staffName, trainingName, category - up to 500 rows
              </p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-foreground/80 font-medium">{fileName}</span>
                  <span className="text-xs text-muted-foreground">{rows.length} rows detected</span>
                </div>
                <button onClick={reset} className="text-xs text-muted-foreground/70 hover:text-red-400 transition-colors">
                  Clear
                </button>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto max-h-48 overflow-y-auto border border-border rounded-lg">
                <table className="text-xs min-w-max w-full">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr>
                      {headers.slice(0, 8).map(h => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                      ))}
                      {headers.length > 8 && <th className="text-left px-3 py-2 text-muted-foreground/50">+{headers.length - 8} more</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        {headers.slice(0, 8).map(h => (
                          <td key={h} className="px-3 py-1.5 text-foreground/80 max-w-[140px] truncate">{row[h] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr>
                        <td colSpan={Math.min(headers.length, 9)} className="px-3 py-2 text-xs text-muted-foreground/50 text-center">
                          &hellip; and {rows.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  onClick={doImport}
                  disabled={importing}
                  className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {importing ? 'Importing\u2026' : `Import ${rows.length} Records`}
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* Results */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 border border-emerald-700/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{result.created}</p>
              <p className="text-xs text-muted-foreground">Records imported</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${result.failed > 0 ? 'bg-red-950/20 border-red-700/30' : 'bg-card border-border'}`}>
              <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{result.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>

          {result.failed > 0 && (
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {result.results.filter(r => !r.ok).map(r => (
                <div key={r.index} className="flex items-start gap-2 text-red-400">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Row {r.index + 2}: {r.error}</span>
                </div>
              ))}
            </div>
          )}

          {result.created > 0 && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.created} training record{result.created > 1 ? 's' : ''} successfully imported.</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">Import another file</button>
            <button onClick={() => { setOpen(false); reset(); }} className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
