'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Users, Sparkles, CheckCircle2,
  ChevronRight, ArrowRight, Loader2, BookOpen,
  PlayCircle, LayoutDashboard,
} from 'lucide-react';

const STEPS = [
  {
    id: 'facility',
    title: 'Configure your facility',
    description: 'Set your facility name, type, address, license number, and NPI so NyxCitadel can tailor compliance deadlines and reports to your organisation.',
    icon: Building2,
    color: 'teal',
    action: { label: 'Open Facility Settings', href: '/settings/facility' },
    hint: 'You can return here and continue once you have saved your facility details.',
  },
  {
    id: 'templates',
    title: 'Apply quick-start templates',
    description: 'Seed your calendar with standard regulatory deadlines (CMS, ADHS, TJC, QAPI), pre-built policy templates, and CAP scaffolding - so your first week is not a blank page.',
    icon: Sparkles,
    color: 'purple',
    action: { label: 'Apply Templates', api: '/api/quick-start' },
    hint: 'Safe to run more than once - duplicates are skipped automatically.',
  },
  {
    id: 'team',
    title: 'Invite your team',
    description: 'Add compliance officers, risk managers, quality staff, and EM coordinators. Each role determines what they can see and edit in NyxCitadel.',
    icon: Users,
    color: 'blue',
    action: { label: 'Manage Users', href: '/settings/users' },
    hint: 'New users receive an email with a secure sign-in link.',
  },
  {
    id: 'done',
    title: "You're set up",
    description: "Your facility is configured, templates are loaded, and your team is ready. Take a quick walkthrough of the main modules or dive straight into the Command Center.",
    icon: CheckCircle2,
    color: 'green',
    links: [
      { label: 'Feature Walkthrough', href: '/walkthrough', icon: PlayCircle },
      { label: 'User Guide', href: '/guide', icon: BookOpen },
      { label: 'Go to Dashboard', href: '/dashboard', icon: LayoutDashboard, primary: true },
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const STEP_IDS: StepId[] = STEPS.map(s => s.id);

const COLOR_MAP = {
  teal:   { ring: 'ring-teal-500/30',   bg: 'bg-teal-500/15',    text: 'text-teal-300',    border: 'border-teal-500/25',   btn: 'bg-teal-600 hover:bg-teal-500'   },
  purple: { ring: 'ring-purple-500/30', bg: 'bg-purple-500/15',  text: 'text-purple-300',  border: 'border-purple-500/25', btn: 'bg-purple-600 hover:bg-purple-500' },
  blue:   { ring: 'ring-blue-500/30',   bg: 'bg-blue-500/15',    text: 'text-blue-300',    border: 'border-blue-500/25',   btn: 'bg-blue-600 hover:bg-blue-500'   },
  green:  { ring: 'ring-green-500/30',  bg: 'bg-green-500/15',   text: 'text-green-300',   border: 'border-green-500/25',  btn: 'bg-green-600 hover:bg-green-500'  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templatesApplied, setTemplatesApplied] = useState(false);

  const step = STEPS[currentIdx];
  const isLast = currentIdx === STEPS.length - 1;

  async function markDone(stepId: StepId) {
    setCompleted(prev => new Set([...prev, stepId]));
    if (currentIdx < STEPS.length - 1) {
      setCurrentIdx(idx => idx + 1);
    }
  }

  async function applyTemplates() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quick-start', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Template application failed');
      }
      setTemplatesApplied(true);
      await markDone('templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function dismissOnboarding() {
    await fetch('/api/onboarding/dismiss', { method: 'POST' }).catch(() => {});
    router.push('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">NyxCitadel Setup</p>
        <h1 className="text-3xl font-bold text-foreground">Welcome - let&apos;s get you live</h1>
        <p className="text-sm text-muted-foreground">
          Four quick steps and your compliance command centre is ready.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const isDone = completed.has(s.id);
          const isActive = i === currentIdx;
          return (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className="flex items-center gap-1"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-teal-500 text-white ring-2 ring-teal-400/40'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`w-8 h-px ${i < currentIdx ? 'bg-green-500/60' : 'bg-border'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Active step card */}
      {(() => {
        const s = step;
        const Icon = s.icon;
        const c = COLOR_MAP[s.color];
        const isDone = completed.has(s.id);

        return (
          <div className={`bg-card border ${c.border} rounded-2xl p-8 space-y-6`}>
            {/* Icon + title */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  Step {currentIdx + 1} of {STEPS.length}
                </p>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{s.title}</h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-700/40 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            {'links' in s ? (
              /* Final step */
              <div className="grid sm:grid-cols-3 gap-3">
                {s.links.map(link => {
                  const LinkIcon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${'primary' in link && link.primary ? `${c.btn} text-white` : 'bg-muted hover:bg-muted/70 text-foreground'}`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ) : 'api' in s.action ? (
              /* Template step */
              <div className="space-y-3">
                {templatesApplied ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> Templates applied successfully
                  </div>
                ) : (
                  <button
                    onClick={applyTemplates}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${c.btn} disabled:opacity-50`}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> {s.action.label}</>
                    )}
                  </button>
                )}
                {!templatesApplied && (
                  <button
                    onClick={() => markDone('templates')}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Skip - I&apos;ll apply templates later
                  </button>
                )}
                {'hint' in s && s.hint && (
                  <p className="text-xs text-muted-foreground/60 italic">{s.hint}</p>
                )}
              </div>
            ) : (
              /* Link step (facility / team) */
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={s.action.href}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${c.btn}`}
                  >
                    {s.action.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-sm text-green-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => markDone(s.id as StepId)}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Mark as done &rarr;
                    </button>
                  )}
                </div>
                {'hint' in s && s.hint && (
                  <p className="text-xs text-muted-foreground/60 italic">{s.hint}</p>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Side step list */}
      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = completed.has(s.id);
          const isActive = i === currentIdx;
          const c = COLOR_MAP[s.color];
          return (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                isActive
                  ? `${c.border} bg-card`
                  : isDone
                  ? 'border-green-700/20 bg-green-950/10'
                  : 'border-transparent bg-transparent hover:bg-muted/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500/20' : c.bg}`}>
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                  : <Icon className={`w-4 h-4 ${c.text}`} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDone ? 'text-muted-foreground line-through' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </p>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
            </button>
          );
        })}
      </div>

      {/* Skip link */}
      <div className="text-center">
        <button
          onClick={dismissOnboarding}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
        >
          Skip setup - go to dashboard
        </button>
      </div>
    </div>
  );
}
