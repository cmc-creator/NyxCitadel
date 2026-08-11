'use client';

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck, ArrowLeft, CheckCircle2, XCircle, MinusCircle,
  ChevronDown, ChevronRight, Save, FileText, Loader2, AlertTriangle
} from 'lucide-react';
import { Chapter, EP } from '@/lib/jc-standards';

// ── Types ─────────────────────────────────────────────────────────────────────

type Score = 'MET' | 'NOT_MET' | 'NOT_APPLICABLE' | 'NOT_EVALUATED';

interface SurveyMeta {
  id: string;
  title: string;
  surveyType: string;
  surveyorName: string | null;
  scheduledDate: string;
  status: string;
  metCount: number;
  notMetCount: number;
  naCount: number;
  overallScore: number | null;
  chaptersScoped: string[];
}

interface SavedFinding {
  id: string;
  standardRef: string;
  epNumber?: string;
  score: Score;
  surveyorNotes: string;
  evidence: string;
  pocCreated: boolean;
  pocId?: string;
}

interface Props {
  survey: SurveyMeta;
  chapters: Chapter[];
  savedFindings: SavedFinding[];
}

// ── Score toggle button ───────────────────────────────────────────────────────

const SCORE_OPTIONS: { value: Score; label: string; cls: string; icon: React.ComponentType<{className?:string}> }[] = [
  { value: 'MET',           label: 'Met',  cls: 'bg-green-900/50 border-green-600 text-green-300', icon: CheckCircle2 },
  { value: 'NOT_MET',       label: 'Not Met', cls: 'bg-red-900/50 border-red-600 text-red-300', icon: XCircle },
  { value: 'NOT_APPLICABLE',label: 'N/A', cls: 'bg-slate-800 border-slate-600 text-slate-400', icon: MinusCircle },
];

// ── EP Row ────────────────────────────────────────────────────────────────────

interface EPRowProps {
  ep: EP;
  surveyId: string;
  initial?: SavedFinding;
  onSaved: (finding: SavedFinding) => void;
}

function EPRow({ ep, surveyId, initial, onSaved }: EPRowProps) {
  const [score, setScore] = useState<Score>(initial?.score ?? 'NOT_EVALUATED');
  const [notes, setNotes] = useState(initial?.surveyorNotes ?? '');
  const [evidence, setEvidence] = useState(initial?.evidence ?? '');
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initial);
  const [dirty, setDirty] = useState(false);

  function handleScore(s: Score) {
    setScore(s);
    setDirty(true);
    setSaved(false);
    setExpanded(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/mock-survey/${surveyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: ep.standard.split('.')[0],
          standardRef: ep.standard,
          epNumber: ep.epNumber,
          epText: ep.text,
          score,
          surveyorNotes: notes,
          evidence,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const finding = await res.json();
      onSaved(finding);
      setSaved(true);
      setDirty(false);
    } catch {
      // silent - user can retry
    } finally {
      setSaving(false);
    }
  }

  const rowBg = score === 'MET'
    ? 'border-l-2 border-l-green-600'
    : score === 'NOT_MET'
    ? 'border-l-2 border-l-red-600'
    : score === 'NOT_APPLICABLE'
    ? 'border-l-2 border-l-slate-600'
    : 'border-l-2 border-l-transparent';

  return (
    <div className={`bg-slate-900/30 rounded-lg mb-2 ${rowBg}`}>
      <div className="flex items-start gap-3 p-3">
        {/* EP ref */}
        <div className="flex-shrink-0 w-28">
          <div className="text-xs font-mono text-teal-400">{ep.standard}</div>
          <div className="text-xs text-slate-500">{ep.epNumber}</div>
          {ep.priority === 'A' && (
            <span className="inline-flex items-center mt-0.5 px-1 py-0.5 rounded text-xs bg-orange-900/40 text-orange-300 font-medium">
              DIPS
            </span>
          )}
        </div>

        {/* EP text */}
        <div className="flex-1 text-sm text-slate-300 leading-relaxed pr-2">{ep.text}</div>

        {/* Score */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {SCORE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = score === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleScore(opt.value)}
                title={opt.label}
                className={`p-1.5 rounded border transition-all ${
                  active ? opt.cls : 'border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Expand / save */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Notes & Evidence"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              className="p-1.5 text-teal-400 hover:text-teal-300 transition-colors"
              title="Save"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          )}
          {saved && !dirty && (
            <CheckCircle2 className="w-4 h-4 text-green-400 opacity-50" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-800 pt-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Surveyor Notes</label>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setDirty(true); setSaved(false); }}
              rows={2}
              placeholder="Observations, staff interviews, record review..."
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Evidence Referenced</label>
            <textarea
              value={evidence}
              onChange={e => { setEvidence(e.target.value); setDirty(true); setSaved(false); }}
              rows={2}
              placeholder="Policy #, medical record MRN, observation location..."
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving || (!dirty)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded transition-colors"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter Panel ─────────────────────────────────────────────────────────────

interface ChapterPanelProps {
  chapter: Chapter;
  surveyId: string;
  findingsMap: Map<string, SavedFinding>;
  onSaved: (finding: SavedFinding) => void;
}

function ChapterPanel({ chapter, surveyId, findingsMap, onSaved }: ChapterPanelProps) {
  const [open, setOpen] = useState(true);

  const allEPs = chapter.standards.flatMap(s => s.eps);
  const met    = allEPs.filter(ep => findingsMap.get(`${ep.standard}|${ep.epNumber}`)?.score === 'MET').length;
  const notMet = allEPs.filter(ep => findingsMap.get(`${ep.standard}|${ep.epNumber}`)?.score === 'NOT_MET').length;
  const na     = allEPs.filter(ep => findingsMap.get(`${ep.standard}|${ep.epNumber}`)?.score === 'NOT_APPLICABLE').length;
  const unscore = allEPs.length - met - notMet - na;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <div className="text-left">
            <div className="font-semibold text-foreground text-sm">
              <span className="text-teal-400 font-mono mr-2">{chapter.code}</span>
              {chapter.title}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {chapter.standards.length} standard{chapter.standards.length !== 1 ? 's' : ''} &middot; {allEPs.length} EPs
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {met > 0    && <span className="text-green-400 font-medium">{met} Met</span>}
          {notMet > 0 && <span className="text-red-400 font-medium">{notMet} Not Met</span>}
          {na > 0     && <span className="text-slate-500">{na} N/A</span>}
          {unscore > 0 && <span className="text-slate-600">{unscore} remaining</span>}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {chapter.standards.map(standard => (
            <div key={standard.ref} className="mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 border-b border-slate-800 pb-1">
                {standard.ref} - {standard.title}
              </div>
              {standard.eps.map(ep => (
                <EPRow
                  key={ep.ref}
                  ep={ep}
                  surveyId={surveyId}
                  initial={findingsMap.get(`${ep.standard}|${ep.epNumber}`)}
                  onSaved={onSaved}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function TracerClient({ survey, chapters, savedFindings }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Build a live findings map: key = "standardRef|epNumber"
  const [findingsMap, setFindingsMap] = useState<Map<string, SavedFinding>>(() => {
    const m = new Map<string, SavedFinding>();
    savedFindings.forEach(f => m.set(`${f.standardRef}|${f.epNumber ?? ''}`, f));
    return m;
  });

  // Running totals from the map
  const findings = Array.from(findingsMap.values());
  const metCount    = findings.filter(f => f.score === 'MET').length;
  const notMetCount = findings.filter(f => f.score === 'NOT_MET').length;
  const naCount     = findings.filter(f => f.score === 'NOT_APPLICABLE').length;
  const scored      = metCount + notMetCount;
  const pct         = scored > 0 ? Math.round((metCount / scored) * 100) : null;

  const onSaved = useCallback((finding: SavedFinding) => {
    setFindingsMap(prev => {
      const next = new Map(prev);
      next.set(`${finding.standardRef}|${finding.epNumber ?? ''}`, finding);
      return next;
    });
  }, []);

  async function markComplete() {
    await fetch(`/api/mock-survey/${survey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', completedDate: new Date().toISOString() }),
    });
    startTransition(() => router.push(`/surveys/mock/${survey.id}/report`));
  }

  const TYPE_LABELS: Record<string, string> = {
    JC_FULL: 'JC Full Survey', JC_FOCUSED: 'JC Focused',
    JC_DISEASE_SPECIFIC: 'JC Disease-Specific', CMS_CONDITION_LEVEL: 'CMS Condition Level',
    ADHS_LICENSING: 'ADHS Licensing', INTERNAL_AUDIT: 'Internal Audit',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/surveys/mock" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Surveys
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-400" />
            {survey.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {TYPE_LABELS[survey.surveyType]} &middot;
            {survey.surveyorName ? ` Surveyor: ${survey.surveyorName} ·` : ''} {survey.chaptersScoped.join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/surveys/mock/${survey.id}/report`}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-slate-300 hover:text-foreground text-sm rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Findings Report
          </Link>
          <button
            onClick={markComplete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Complete Survey
          </button>
        </div>
      </div>

      {/* Score scoreboard */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Overall Score</div>
          <div className={`text-2xl font-bold ${
            pct === null ? 'text-slate-600' :
            pct >= 80 ? 'text-green-400' :
            pct >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {pct !== null ? `${pct}%` : '-'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Met</div>
          <div className="text-2xl font-bold text-green-400">{metCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Not Met</div>
          <div className="text-2xl font-bold text-red-400">{notMetCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">N/A</div>
          <div className="text-2xl font-bold text-slate-500">{naCount}</div>
        </div>
      </div>

      {notMetCount > 0 && (
        <div className="flex items-center gap-2 bg-red-950/30 border border-red-800 rounded-lg px-4 py-2 text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {notMetCount} Not Met finding{notMetCount !== 1 ? 's' : ''} - view the Findings Report to create Plans of Correction.
        </div>
      )}

      {/* Chapter panels */}
      <div className="space-y-4">
        {chapters.map(ch => (
          <ChapterPanel
            key={ch.code}
            chapter={ch}
            surveyId={survey.id}
            findingsMap={findingsMap}
            onSaved={onSaved}
          />
        ))}
      </div>
    </div>
  );
}
