import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileCheck2 , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  PENDING_RENEWAL: 'bg-yellow-100 text-yellow-800',
  TERMINATED: 'bg-gray-100 text-gray-600',
  UNDER_NEGOTIATION: 'bg-blue-100 text-blue-800',
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

export default async function BaaDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const baa = await prisma.baaTracker.findUnique({ where: { id: params.id } });

  if (!baa || baa.facilityId !== session.user.facilityId) notFound();

  const isExpiring = baa.expiryDate && new Date(baa.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/hipaa/baa" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to BAA Tracker
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/hipaa/baa/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[baa.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                {baa.status.replace(/_/g, ' ')}
              </span>
              {isExpiring && baa.status === 'ACTIVE' && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">Expiring Soon</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{baa.vendorName}</h1>
            <p className="text-sm text-muted-foreground mt-1">BAA Effective: <strong>{formatDate(baa.agreementDate)}</strong>
              {baa.expiryDate && <> &middot; Expires: <strong>{formatDate(baa.expiryDate)}</strong></>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Service Description">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{baa.serviceDescription}</p>
          </Section>

          {baa.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{baa.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Vendor Information">
            <dl className="space-y-3">
              <Field label="Vendor Name" value={baa.vendorName} />
              <Field label="Contact" value={baa.vendorContact} />
              <Field label="Email" value={baa.vendorEmail} />
            </dl>
          </Section>

          <Section title="Agreement Details">
            <dl className="space-y-3">
              <Field label="Agreement Date" value={formatDate(baa.agreementDate)} />
              {baa.expiryDate && <Field label="Expiry Date" value={formatDate(baa.expiryDate)} />}
              <div>
                <dt className="text-xs text-muted-foreground/70">Auto-Renew</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">{baa.autoRenew ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground/70">HIPAA Compliance Verified</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${baa.phoneHipaaVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {baa.phoneHipaaVerified ? 'Yes' : 'Not Verified'}
                </dd>
              </div>
            </dl>
          </Section>

          {baa.documentUrl && (
            <Section title="Document">
              <a href={baa.documentUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">View Agreement Document</a>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
