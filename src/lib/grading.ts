/**
 * Shared grading utility — single source of truth for all grade logic in NyxCitadel.
 * Used by: drill scorecard, resilience scorecard, board report.
 */

// ─── 12-point scale (drill scorecard) ────────────────────────────────────────

export function scoreToGrade12(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

// ─── 5-point scale (facility resilience) ─────────────────────────────────────

export function scoreToGrade5(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'A', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { label: 'B', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' };
  if (score >= 70) return { label: 'C', color: 'text-yellow-700',  bg: 'bg-yellow-50 border-yellow-200' };
  if (score >= 60) return { label: 'D', color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' };
  return               { label: 'F', color: 'text-red-700',        bg: 'bg-red-50 border-red-200' };
}

// ─── Grade-to-color helper (for 12-point grades in UI) ───────────────────────

export function gradeColor12(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-yellow-600';
  if (grade.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}

// ─── Convert a 12-point grade string back to a numeric midpoint ──────────────

export function grade12ToScore(grade: string): number {
  const map: Record<string, number> = {
    'A+': 98, A: 94, 'A-': 91,
    'B+': 88, B: 84, 'B-': 81,
    'C+': 78, C: 74, 'C-': 71,
    'D+': 68, D: 61, F: 50,
  };
  return map[grade] ?? 0;
}

// ─── Domain-specific sub-scores ───────────────────────────────────────────────

export function incidentScore(count: number): number {
  if (count === 0) return 100;
  if (count <= 2)  return 80;
  if (count <= 5)  return 60;
  if (count <= 10) return 40;
  return 20;
}

export function capScore(count: number): number {
  if (count === 0) return 100;
  if (count <= 2)  return 85;
  if (count <= 5)  return 70;
  return 55;
}

export function grievanceScore(count: number): number {
  if (count === 0) return 100;
  if (count <= 2)  return 80;
  return 60;
}

// ─── Drill score (used by /api/drills/[id]/end and scorecard page) ────────────

export function evacuationScore(seconds: number): number {
  if (seconds <= 240) return 100;
  return Math.max(40, 100 - Math.floor((seconds - 240) / 30) * 5);
}

export function commScore(lagSeconds: number): number {
  if (lagSeconds <= 30) return 100;
  return Math.max(40, 100 - Math.floor((lagSeconds - 30) / 10) * 5);
}

export function drillCompositeScore(
  accountabilityPct: number,
  taskMasteryPct: number,
  evacSeconds: number | null,
  commLagSeconds: number | null,
): number {
  const evac = evacSeconds != null ? evacuationScore(evacSeconds) : accountabilityPct; // fallback
  const comm = commLagSeconds != null ? commScore(commLagSeconds) : taskMasteryPct;
  return Math.round(
    accountabilityPct * 0.30 +
    taskMasteryPct    * 0.30 +
    evac              * 0.25 +
    comm              * 0.15,
  );
}
