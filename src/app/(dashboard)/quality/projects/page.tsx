import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { QapiProject } from '@prisma/client';
import { Plus, Target, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'QAPI Projects' };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-blue-950/20 text-blue-700',
  MONITORING: 'bg-teal-950/20 text-teal-700',
  COMPLETED: 'bg-green-50 text-green-700',
  SUSPENDED: 'bg-yellow-50 text-yellow-700',
  CANCELLED: 'bg-muted/30 text-muted-foreground',
};

const CATEGORY_COLORS: Record<string, string> = {
  PATIENT_SAFETY: 'bg-red-100 text-red-700',
  RESTRAINT_SECLUSION: 'bg-orange-100 text-orange-700',
  MEDICATION_SAFETY: 'bg-yellow-100 text-yellow-700',
  CLINICAL_CARE: 'bg-blue-100 text-blue-700',
  INFECTION_PREVENTION: 'bg-teal-100 text-teal-700',
  PATIENT_EXPERIENCE: 'bg-green-100 text-green-700',
  STAFF_SAFETY: 'bg-teal-100 text-teal-700',
  READMISSIONS: 'bg-indigo-100 text-indigo-700',
  COMPLIANCE: 'bg-teal-100 text-teal-700',
  WORKFORCE: 'bg-pink-100 text-pink-700',
  OTHER: 'bg-muted/30 text-muted-foreground',
  THROUGHPUT: 'bg-cyan-100 text-cyan-700',
};

export default async function QapiProjectsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const projects = await prisma.qapiProject.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
  });

  const active = projects.filter(p => ['ACTIVE', 'MONITORING'].includes(p.status));
  const completed = projects.filter(p => p.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-600" />
            QAPI Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">CMS 42 CFR 482.21 · Performance Improvement Projects (PIPs)</p>
        </div>
        <Link
          href="/quality/projects/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New QAPI Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{active.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Active Projects</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{completed.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground/80">{projects.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Projects</p>
        </div>
      </div>

      {/* Active projects */}
      {active.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-base font-semibold text-foreground">Active & Monitoring</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {active.map(p => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-base font-semibold text-foreground">Completed</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {completed.map(p => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 text-muted-foreground/70">
          <Target className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm font-medium">No QAPI projects yet</p>
          <p className="text-xs mt-1">CMS requires at least 2 active PIPs annually</p>
          <Link href="/quality/projects/new" className="mt-4 text-sm text-teal-600 hover:underline font-medium">
            + Start your first project
          </Link>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project }: { project: QapiProject }) {
  const isOverdue = project.status !== 'COMPLETED' && new Date(project.targetDate) < new Date();

  return (
    <Link href={`/quality/projects/${project.id}`} className="block px-6 py-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{project.title}</p>
            <span className="text-xs text-muted-foreground/70 font-mono">{project.projectNumber}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[project.category] ?? 'bg-muted/30 text-muted-foreground'}`}>
              {project.category.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.problemStatement}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/70">
            <span>Owner: {project.owner ?? '-'}</span>
            <span>Target: {formatDate(new Date(project.targetDate), 'MMM d, yyyy')}</span>
            {project.baselineValue !== null && <span>Baseline: {project.baselineValue}{project.targetUnit ?? ''}</span>}
            {project.targetValue !== null && <span>Goal: {project.targetValue}{project.targetUnit ?? ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOverdue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[project.status] ?? ''}`}>
            {project.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
