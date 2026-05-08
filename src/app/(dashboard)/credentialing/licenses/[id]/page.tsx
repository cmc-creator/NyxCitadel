import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, IdCard , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  REVOKED: 'bg-red-200 text-red-900',
  PENDING_RENEWAL: 'bg-yellow-100 text-yellow-800',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

export default async function LicenseDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const license = await prisma.providerLicense.findUnique({
    where: { id: params.id },
    include: { provider: { select: { id: true, firstName: true, lastName: true, credentials: true, facilityId: true } } },
  });

  if (!license || license.provider.facilityId !== session.user.facilityId) notFound();

  const isExpiringSoon = license.status === 'ACTIVE' &&
    new Date(license.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/credentialing/licenses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Licenses
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/credentialing/licenses/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <IdCard className="w-5 h-5 text-teal-600" />
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[license.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                {license.status.replace(/_/g, ' ')}
              </span>
              {isExpiringSoon && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">Expiring Soon</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{license.licenseType}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {license.provider.firstName} {license.provider.lastName}, {license.provider.credentials} &middot; {license.state}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="License Details">
          <dl className="space-y-3">
            <Field label="License Type" value={license.licenseType} />
            <Field label="License Number" value={license.licenseNumber} />
            <Field label="State" value={license.state} />
            {license.issuedDate && <Field label="Issue Date" value={formatDate(license.issuedDate)} />}
            <Field label="Expiry Date" value={formatDate(license.expiryDate)} />
          </dl>
        </Section>

        <Section title="Verification">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground/70">Verified</dt>
              <dd className={`text-sm font-semibold mt-0.5 ${license.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {license.isVerified ? 'Yes - Primary Source Verified' : 'Not Yet Verified'}
              </dd>
            </div>
            {license.verifiedDate && <Field label="Verification Date" value={formatDate(license.verifiedDate)} />}
            {license.verifiedBy && <Field label="Verified By" value={license.verifiedBy} />}
          </dl>
        </Section>
      </div>

      <Section title="Provider">
        <Link href={`/credentialing/providers/${license.provider.id}`} className="text-sm text-teal-600 hover:underline">
          {license.provider.firstName} {license.provider.lastName}, {license.provider.credentials} →
        </Link>
      </Section>
    </div>
  );
}
