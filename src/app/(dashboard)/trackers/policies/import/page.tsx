'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Download, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedRow {
  _line: number;
  title: string;
  category: string;
  policyNumber?: string;
  version?: string;
  owner?: string;
  standardRef?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
  reviewFrequency?: string;
  status?: string;
  description?: string;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = new Set([
  'ADMINISTRATIVE','CLINICAL','EMERGENCY_MANAGEMENT','ENVIRONMENT_OF_CARE',
  'HUMAN_RESOURCES','INFECTION_CONTROL','INFORMATION_MANAGEMENT','LEADERSHIP',
  'LIFE_SAFETY','MEDICATION_MANAGEMENT','PATIENT_RIGHTS','PERFORMANCE_IMPROVEMENT',
  'PRIVACY_SECURITY','OTHER',
]);

const CATEGORY_ALIASES: Record<string, string> = {
  'administrative': 'ADMINISTRATIVE',
  'clinical': 'CLINICAL',
  'emergency management': 'EMERGENCY_MANAGEMENT',
  'emergency': 'EMERGENCY_MANAGEMENT',
  'em': 'EMERGENCY_MANAGEMENT',
  'environment of care': 'ENVIRONMENT_OF_CARE',
  'eoc': 'ENVIRONMENT_OF_CARE',
  'human resources': 'HUMAN_RESOURCES',
  'hr': 'HUMAN_RESOURCES',
  'infection control': 'INFECTION_CONTROL',
  'ic': 'INFECTION_CONTROL',
  'information management': 'INFORMATION_MANAGEMENT',
  'im': 'INFORMATION_MANAGEMENT',
  'leadership': 'LEADERSHIP',
  'life safety': 'LIFE_SAFETY',
  'ls': 'LIFE_SAFETY',
  'medication management': 'MEDICATION_MANAGEMENT',
  'mm': 'MEDICATION_MANAGEMENT',
  'patient rights': 'PATIENT_RIGHTS',
  'pr': 'PATIENT_RIGHTS',
  'performance improvement': 'PERFORMANCE_IMPROVEMENT',
  'pi': 'PERFORMANCE_IMPROVEMENT',
  'privacy security': 'PRIVACY_SECURITY',
  'privacy & security': 'PRIVACY_SECURITY',
  'ps': 'PRIVACY_SECURITY',
  'other': 'OTHER',
};

const FREQ_ALIASES: Record<string, string> = {
  'annual': 'ANNUAL', 'annually': 'ANNUAL', 'yearly': 'ANNUAL',
  'biennial': 'BIENNIAL', 'every 2 years': 'BIENNIAL', 'every two years': 'BIENNIAL',
  'semi-annual': 'SEMI_ANNUAL', 'semi annual': 'SEMI_ANNUAL', 'biannual': 'SEMI_ANNUAL', 'twice a year': 'SEMI_ANNUAL',
  'quarterly': 'QUARTERLY', 'every 3 months': 'QUARTERLY',
  'as needed': 'AS_NEEDED', 'as_needed': 'AS_NEEDED', 'n/a': 'AS_NEEDED',
};

const STATUS_ALIASES: Record<string, string> = {
  'draft': 'DRAFT', 'active': 'ACTIVE', 'under review': 'UNDER_REVIEW',
  'under_review': 'UNDER_REVIEW', 'archived': 'ARCHIVED',
};

const CSV_TEMPLATE = `policy_number,title,category,version,owner,standard_ref,effective_date,next_review_date,review_frequency,status,description
PR-001,Patient Rights and Responsibilities,PATIENT_RIGHTS,1.0,Director of Nursing,42 CFR 482.13,2024-01-01,2025-01-01,ANNUAL,ACTIVE,Policy governing patient rights and responsibilities
CLN-001,Restraint and Seclusion,CLINICAL,2.1,Medical Director,CMS CoP 482.13(e),2024-01-01,2025-01-01,ANNUAL,ACTIVE,Policy for use of restraint and seclusion in clinical settings
HR-001,Employee Code of Conduct,HUMAN_RESOURCES,1.0,Human Resources,Internal,2024-01-01,2025-01-01,ANNUAL,ACTIVE,Standards for employee conduct and professional behavior`;

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCell(v: string): string {
  return v.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function normalizeDate(v: string): string | undefined {
  if (!v) return undefined;
  // Accepts: YYYY-MM-DD, MM/DD/YYYY, M/D/YYYY
  const iso = v.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return v;
  const slash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`;
  return undefined;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[\s-]/g, '_').replace(/[^a-z0-9_]/g, ''));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = parseCell(cells[idx] ?? ''); });

    const title = row['title'] ?? '';
    let category = (row['category'] ?? '').toUpperCase();
    if (!VALID_CATEGORIES.has(category)) {
      category = CATEGORY_ALIASES[category.toLowerCase()] ?? CATEGORY_ALIASES[(row['category'] ?? '').toLowerCase()] ?? 'OTHER';
    }

    const freq = row['review_frequency'] ?? row['reviewfrequency'] ?? 'ANNUAL';
    const normFreq = FREQ_ALIASES[freq.toLowerCase()] ?? freq.toUpperCase();
    const status = row['status'] ?? 'ACTIVE';
    const normStatus = STATUS_ALIASES[status.toLowerCase()] ?? status.toUpperCase();

    const effDate = normalizeDate(row['effective_date'] ?? row['effectivedate'] ?? '');
    const nextDate = normalizeDate(row['next_review_date'] ?? row['nextreviewdate'] ?? row['next_review'] ?? '');

    const parsed: ParsedRow = {
      _line:          i + 1,
      title:          title.trim(),
      category,
      policyNumber:   (row['policy_number'] ?? row['policynumber'] ?? row['policy_num'] ?? '').trim() || undefined,
      version:        (row['version'] ?? '1.0').trim(),
      owner:          (row['owner'] ?? row['responsible_role'] ?? '').trim() || undefined,
      standardRef:    (row['standard_ref'] ?? row['standardref'] ?? row['standard_reference'] ?? '').trim() || undefined,
      effectiveDate:  effDate,
      nextReviewDate: nextDate,
      reviewFrequency: normFreq,
      status:         normStatus,
      description:    (row['description'] ?? row['summary'] ?? '').trim() || undefined,
    };

    if (!title) parsed.error = 'Missing title';
    else if (!effDate) parsed.error = 'Invalid or missing effective_date (use YYYY-MM-DD)';
    else if (!nextDate) parsed.error = 'Invalid or missing next_review_date (use YYYY-MM-DD)';

    rows.push(parsed);
  }
  return rows;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ImportPoliciesPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows]           = useState<ParsedRow[]>([]);
  const [fileName, setFileName]   = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults]     = useState<{ ok: number; failed: number } | null>(null);
  const [errors, setErrors]       = useState<string[]>([]);

  const validRows    = rows.filter(r => !r.error);
  const invalidRows  = rows.filter(r => r.error);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResults(null);
    setErrors([]);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  }

  function clearFile() {
    setRows([]);
    setFileName('');
    setResults(null);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleImport() {
    if (!validRows.length) return;
    setImporting(true);
    setResults(null);
    setErrors([]);

    let ok = 0;
    let failed = 0;
    const errs: string[] = [];

    for (const row of validRows) {
      try {
        const res = await fetch('/api/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:           row.title,
            policyNumber:    row.policyNumber,
            category:        row.category,
            version:         row.version ?? '1.0',
            owner:           row.owner ?? null,
            standardRef:     row.standardRef ?? null,
            effectiveDate:   row.effectiveDate,
            nextReviewDate:  row.nextReviewDate,
            reviewFrequency: row.reviewFrequency ?? 'ANNUAL',
            status:          row.status ?? 'ACTIVE',
            description:     row.description ?? null,
            regulatoryBodies: [],
          }),
        });
        if (res.ok) {
          ok++;
        } else {
          const err = await res.json();
          failed++;
          errs.push(`Row ${row._line} (${row.title}): ${err.error ?? 'Failed'}`);
        }
      } catch {
        failed++;
        errs.push(`Row ${row._line} (${row.title}): Network error`);
      }
    }

    setResults({ ok, failed });
    setErrors(errs);
    setImporting(false);

    if (ok > 0 && failed === 0) {
      setTimeout(() => {
        router.push('/trackers/policies');
        router.refresh();
      }, 1500);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'policy-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <a href="/trackers/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Policy Tracker
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-teal-600" />
          Bulk Import Policies
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a CSV file to import multiple policies at once. Download the template below to get started.
        </p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-4">
        <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 mb-1">Download the import template</p>
          <p className="text-xs text-blue-700 mb-2">
            Required columns: <code className="bg-blue-100 px-1 rounded">title</code>, <code className="bg-blue-100 px-1 rounded">category</code>, <code className="bg-blue-100 px-1 rounded">effective_date</code>, <code className="bg-blue-100 px-1 rounded">next_review_date</code>
            <br />
            Optional: <code className="bg-blue-100 px-1 rounded">policy_number</code>, <code className="bg-blue-100 px-1 rounded">version</code>, <code className="bg-blue-100 px-1 rounded">owner</code>, <code className="bg-blue-100 px-1 rounded">standard_ref</code>, <code className="bg-blue-100 px-1 rounded">review_frequency</code>, <code className="bg-blue-100 px-1 rounded">status</code>, <code className="bg-blue-100 px-1 rounded">description</code>
            <br />
            Dates must be in <strong>YYYY-MM-DD</strong> or <strong>MM/DD/YYYY</strong> format.
            Policy numbers are auto-generated if omitted.
          </p>
          <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
            <Download className="w-3.5 h-3.5" /> Download Template CSV
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Upload CSV File</h2>
        {!fileName ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">Click to upload your policies CSV</span>
            <span className="text-xs text-slate-400 mt-1">CSV files only</span>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>
        ) : (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <FileText className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{fileName}</p>
              <p className="text-xs text-slate-500">{rows.length} rows parsed &mdash; {validRows.length} valid, {invalidRows.length} with errors</p>
            </div>
            <button onClick={clearFile} className="p-1 text-slate-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Validation errors */}
      {invalidRows.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {invalidRows.length} row{invalidRows.length > 1 ? 's' : ''} will be skipped (fix these in your CSV and re-upload)
          </p>
          <ul className="space-y-1">
            {invalidRows.map(r => (
              <li key={r._line} className="text-xs text-amber-700">
                Line {r._line}: <strong>{r.title || '(no title)'}</strong> &mdash; {r.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Table */}
      {validRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">{validRows.length} policies ready to import</span>
            <button
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition"
            >
              {importing ? 'Importing...' : `Import ${validRows.length} Policies`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">LINE</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">POLICY #</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">TITLE</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">CATEGORY</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">EFFECTIVE</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">NEXT REVIEW</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {validRows.map(r => (
                  <tr key={r._line} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-400">{r._line}</td>
                    <td className="px-4 py-2 font-mono text-slate-500">{r.policyNumber ?? <span className="text-slate-300">auto</span>}</td>
                    <td className="px-4 py-2 text-slate-700 max-w-[200px] truncate">{r.title}</td>
                    <td className="px-4 py-2 text-slate-500">{r.category.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2 text-slate-500">{r.effectiveDate}</td>
                    <td className="px-4 py-2 text-slate-500">{r.nextReviewDate}</td>
                    <td className="px-4 py-2 text-slate-500">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Results */}
      {results && (
        <div className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${results.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          {results.failed === 0 ? (
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {results.ok} imported successfully{results.failed > 0 && `, ${results.failed} failed`}
            </p>
            {results.failed === 0 && (
              <p className="text-xs text-green-700 mt-0.5">Redirecting to policy list...</p>
            )}
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-600 mt-1">{e}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
