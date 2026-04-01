import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, Plus, Info, Calendar } from 'lucide-react';
import Link from 'next/link';
import HvaYearInput from './HvaYearInput';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'HVA – Hazard Vulnerability Analysis' };

export default async function HvaPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const currentYear = new Date().getFullYear();

  const assessments = await prisma.hvaAssessment.findMany({
    where: { facilityId },
    orderBy: { assessmentYear: 'desc' },
    include: { hazards: { orderBy: { riskScore: 'desc' } } },
  });

  const currentYearHva = assessments.find((a) => a.assessmentYear === currentYear);

  const riskLevel = (score: number) => {
    if (score >= 0.7) return { label: 'HIGH', color: 'bg-red-500' };
    if (score >= 0.4) return { label: 'MEDIUM', color: 'bg-yellow-500' };
    return { label: 'LOW', color: 'bg-green-500' };
  };

  const hazardTypeColor: Record<string, string> = {
    NATURAL:        'bg-sky-100 text-sky-800',
    TECHNOLOGICAL:  'bg-violet-100 text-violet-800',
    HUMAN:          'bg-red-100 text-red-800',
    HAZMAT:         'bg-orange-100 text-orange-800',
    INFRASTRUCTURE: 'bg-slate-100 text-slate-700',
  };

  // Quick-year buttons: show last 4 years
  const quickYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const yearHasData = (y: number) => assessments.some(a => a.assessmentYear === y);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Hazard Vulnerability Analysis (HVA)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Annual Kaiser Permanente-style HVA &middot; JC Standard EM.01.01.01</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Link
            href={`/emergency/hva/${currentYear}/edit`}
            className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {currentYearHva ? `Edit ${currentYear} HVA` : `Start ${currentYear} HVA`}
          </Link>
        </div>
      </div>

      {/* ── Year Navigation ── */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />Quick Access
          </div>
          <div className="flex flex-wrap gap-2">
            {quickYears.map(y => (
              <Link key={y} href={`/emergency/hva/${y}/edit`}
                className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  yearHasData(y)
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}>
                {y}
                {yearHasData(y)
                  ? <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded ml-0.5">✓</span>
                  : <span className="text-xs text-slate-400 ml-0.5">+</span>}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto border-l border-slate-100 pl-4">
            <span className="text-xs text-slate-500 whitespace-nowrap">Other year:</span>
            <HvaYearInput />
          </div>
        </div>
      </div>

      {/* ── Methodology note ── */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">HVA Scoring Methodology:</span> Each hazard is scored on{' '}
          <span className="font-medium">Probability (0-3)</span> x <span className="font-medium">Magnitude/Severity (0-3)</span>{' '}
          x <span className="font-medium">Preparedness Gap (0-3)</span> then normalized.{' '}
          Results should drive your annual drill plan and resource allocation.
          Required annually per JC EM.01.01.01.
        </p>
      </div>

      {/* ── Top 3 High-Risk Action Panel ── */}
      {currentYearHva && currentYearHva.hazards.length > 0 && (() => {
        const topHazards = [...currentYearHva.hazards]
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 3);
        const highRisk = topHazards.filter(h => h.riskScore >= 0.7);
        return (
          <div className={`rounded-xl border p-4 ${highRisk.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className={`w-4 h-4 ${highRisk.length > 0 ? 'text-red-600' : 'text-amber-600'}`} />
              <span className={`text-sm font-bold ${highRisk.length > 0 ? 'text-red-800' : 'text-amber-800'}`}>
                {currentYear} Top {topHazards.length} Priority Hazards
              </span>
            </div>
            <div className="space-y-2">
              {topHazards.map((hazard, i) => {
                const risk = riskLevel(hazard.riskScore);
                return (
                  <div key={hazard.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-white/60">
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      risk.label === 'HIGH' ? 'bg-red-100 text-red-700' :
                      risk.label === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{hazard.hazardName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          risk.label === 'HIGH' ? 'bg-red-100 text-red-700' :
                          risk.label === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{risk.label} - {(hazard.riskScore * 100).toFixed(0)}%</span>
                      </div>
                      {hazard.mitigationPlan ? (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{hazard.mitigationPlan}</p>
                      ) : (
                        <p className="text-xs text-red-500 mt-0.5 font-medium">No mitigation plan documented</p>
                      )}
                    </div>
                    {!hazard.mitigationPlan && (
                      <Link href={`/emergency/hva/${currentYear}/edit`}
                        className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap">
                        Add mitigation
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Assessment cards ── */}
      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-medium">No HVA assessments found.</p>
          <p className="text-sm mt-1">
            <Link href={`/emergency/hva/${currentYear}/edit`} className="text-amber-600 hover:underline">
              Start {currentYear} HVA
            </Link>
            {' '}&mdash; or enter any prior year using the year picker above.
          </p>
        </div>
      ) : (
        assessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Assessment Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-900">{assessment.assessmentYear} HVA</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  assessment.status === 'APPROVED'   ? 'bg-green-100 text-green-800' :
                  assessment.status === 'COMPLETED'  ? 'bg-blue-100 text-blue-800' :
                  assessment.status === 'REVIEWED'   ? 'bg-teal-100 text-teal-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {assessment.status.replace('_',' ')}
                </span>
                {assessment.completedDate && (
                  <span className="text-xs text-slate-500">Completed: {formatDate(assessment.completedDate)}</span>
                )}
                {assessment.totalRiskScore != null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    assessment.totalRiskScore >= 0.7 ? 'bg-red-50 text-red-700' :
                    assessment.totalRiskScore >= 0.4 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                  }`}>
                    Avg Risk: {(assessment.totalRiskScore * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {assessment.documentUrl && (
                  <a href={assessment.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-amber-600 border border-slate-200 px-2 py-1 rounded">
                    View Doc
                  </a>
                )}
                <Link href={`/emergency/hva/${assessment.assessmentYear}/edit`}
                  className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors">
                  Edit
                </Link>
              </div>
            </div>

            {/* Hazards table */}
            {assessment.hazards.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                No hazards added yet.{' '}
                <Link href={`/emergency/hva/${assessment.assessmentYear}/edit`} className="text-amber-600 hover:underline">Add hazards</Link>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100">
                    <tr className="text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-6 py-2 font-semibold">Hazard</th>
                      <th className="text-left px-4 py-2 font-semibold">Type</th>
                      <th className="text-center px-4 py-2 font-semibold">Probability</th>
                      <th className="text-center px-4 py-2 font-semibold">Magnitude</th>
                      <th className="text-center px-4 py-2 font-semibold">Preparedness</th>
                      <th className="text-left px-4 py-2 font-semibold">Risk Score</th>
                      <th className="text-left px-4 py-2 font-semibold">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {assessment.hazards.map((hazard) => {
                      const risk = riskLevel(hazard.riskScore);
                      return (
                        <tr key={hazard.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-800">{hazard.hazardName}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${hazardTypeColor[hazard.hazardType] ?? ''}`}>
                              {hazard.hazardType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700">{hazard.probability}/3</td>
                          <td className="px-4 py-3 text-center text-slate-700">{hazard.magnitude}/3</td>
                          <td className="px-4 py-3 text-center text-slate-700">{hazard.preparedness}/3</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${risk.color}`} style={{ width: `${hazard.riskScore * 100}%` }} />
                              </div>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                risk.label === 'HIGH'   ? 'bg-red-100 text-red-800' :
                                risk.label === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {risk.label} ({(hazard.riskScore * 100).toFixed(0)}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                            {hazard.mitigationPlan ?? '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}