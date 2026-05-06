'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { SurveyReadinessResult } from '@/lib/survey-readiness';

const gradeColor: Record<string, string> = {
  A: 'text-emerald-400',
  B: 'text-teal-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

const domainBarColor = (pct: number) =>
  pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';

function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10b981' : score >= 80 ? '#14b8a6' : score >= 70 ? '#f59e0b' : score >= 60 ? '#f97316' : '#ef4444';

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
      {/* Progress */}
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{score}</text>
      <text x="70" y="83" textAnchor="middle" fontSize="11" fill="#94a3b8">out of 100</text>
    </svg>
  );
}

export function ReadinessScore() {
  const [data, setData] = useState<SurveyReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/survey-readiness')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-card rounded-xl border border-border p-5 h-52 animate-pulse" />;
  }

  if (!data) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        <h3 className="text-sm font-semibold text-foreground">Survey Readiness Score</h3>
        <span className={`ml-auto text-2xl font-bold ${gradeColor[data.grade]}`}>
          {data.grade}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge score={data.score} />
        </div>

        {/* Domain breakdown */}
        <div className="flex-1 w-full space-y-2.5">
          {Object.values(data.domains).map(domain => (
            <div key={domain.label}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-muted-foreground">{domain.label}</span>
                <span className="text-xs font-medium text-foreground/80">
                  {domain.score}/{domain.maxScore}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${domainBarColor(domain.pct)}`}
                  style={{ width: `${domain.pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground/50 mt-0.5">{domain.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
