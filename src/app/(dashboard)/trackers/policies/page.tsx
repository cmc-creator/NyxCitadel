import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FileText } from 'lucide-react';
import PoliciesClient, { PolicyRow } from '@/components/policies/PoliciesClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Policy & Procedure Tracker | NyxCitadel' };

export default async function PoliciesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId!;

  const rawPolicies = await prisma.policy.findMany({
    where: { facilityId },
    orderBy: [{ nextReviewDate: 'asc' }, { title: 'asc' }],
  });

  const policies: PolicyRow[] = rawPolicies.map(p => ({
    id:               p.id,
    policyNumber:     p.policyNumber,
    title:            p.title,
    category:         p.category as string,
    version:          p.version,
    owner:            p.owner,
    standardRef:      p.standardRef,
    summary:          p.summary,
    documentUrl:      p.documentUrl,
    effectiveDate:    p.effectiveDate.toISOString(),
    nextReviewDate:   p.nextReviewDate.toISOString(),
    lastReviewedDate: p.lastReviewedDate?.toISOString() ?? null,
    reviewFrequency:  p.reviewFrequency as string,
    status:           p.status as string,
    regulatoryBody:   p.regulatoryBody as string[],
  }));

  return (
    <div className="max-w-screen-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" />
          Policies &amp; Procedures
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track, review, upload, and manage all facility policies and procedures.
        </p>
      </div>

      <PoliciesClient initialData={policies} />
    </div>
  );
}