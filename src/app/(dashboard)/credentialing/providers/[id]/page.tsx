import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, UserCheck, IdCard } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const PROVIDER_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  RESIGNED: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-orange-100 text-orange-800',
  REVOKED: 'bg-red-200 text-red-900',
};

const LICENSE_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  REVOKED: 'bg-red-200 text-red-900',
  PENDING_RENEWAL: 'bg-yellow-100 text-yellow-800',
};

const PRIVILEGE_STATUS_COLOR: Record<string, string> = {
  GRANTED: 'bg-green-100 text-green-800',
  PROVISIONAL: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  REVOKED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const provider = await prisma.provider.findUnique({
    where: { id: params.id },
    include: {
      licenses: { orderBy: { expiryDate: 'asc' } },
      privileges: { orderBy: { grantedDate: 'desc' } },
      oppeRecords: { orderBy: { periodStart: 'desc' }, take: 3 },
      fppeRecords: { orderBy: { startDate: 'desc' }, take: 3 },
    },
  });

  if (!provider || provider.facilityId !== session.user.facilityId) notFound();

  const expiringLicenses = provider.licenses.filter(l =>
    l.status === 'ACTIVE' && new Date(l.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/credentialing/providers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Providers
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-mono text-slate-400">{provider.credentials}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PROVIDER_STATUS_COLOR[provider.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {provider.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{provider.firstName} {provider.lastName}, {provider.credentials}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {provider.specialty} &middot; {provider.providerType.replace(/_/g, ' ')}
              {provider.department && <> &middot; {provider.department}</>}
            </p>
          </div>
        </div>
      </div>

      {expiringLicenses.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-800">License Expiring Soon</p>
          <ul className="text-sm text-orange-700 mt-1 list-disc list-inside">
            {expiringLicenses.map(l => (
              <li key={l.id}>{l.licenseType} ({l.state}) — expires {formatDate(l.expiryDate)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title={`Licenses (${provider.licenses.length})`}>
            {provider.licenses.length === 0 ? (
              <p className="text-sm text-slate-400">No licenses on file.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {provider.licenses.map(lic => (
                  <div key={lic.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lic.licenseType}</p>
                      <p className="text-xs text-slate-500">{lic.licenseNumber} &middot; {lic.state}</p>
                      {lic.expiryDate && <p className="text-xs text-slate-400 mt-0.5">Expires: {formatDate(lic.expiryDate)}</p>}
                    </div>
                    <span className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${LICENSE_STATUS_COLOR[lic.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {lic.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Clinical Privileges (${provider.privileges.length})`}>
            {provider.privileges.length === 0 ? (
              <p className="text-sm text-slate-400">No privileges granted.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {provider.privileges.map(priv => (
                  <div key={priv.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-800">{priv.category}</p>
                      <span className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIVILEGE_STATUS_COLOR[priv.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {priv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{priv.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Granted: {formatDate(priv.grantedDate)}
                      {priv.expiryDate && <> &middot; Expires: {formatDate(priv.expiryDate)}</>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Provider Details">
            <dl className="space-y-3">
              <Field label="NPI" value={provider.npi} />
              <Field label="Email" value={provider.primaryEmail} />
              <Field label="Phone" value={provider.phone} />
              <Field label="Specialty" value={provider.specialty} />
              <Field label="Provider Type" value={provider.providerType.replace(/_/g, ' ')} />
              <Field label="Department" value={provider.department} />
              {provider.initialAppointDate && <Field label="Initial Appointment" value={formatDate(provider.initialAppointDate)} />}
              {provider.reappointmentDate && <Field label="Reappointment Due" value={formatDate(provider.reappointmentDate)} />}
            </dl>
          </Section>

          {provider.oppeRecords.length > 0 && (
            <Section title="Recent OPPE">
              {provider.oppeRecords.map(oppe => (
                <div key={oppe.id} className="py-2 border-b border-slate-100 last:border-0">
                  <p className="text-xs font-medium text-slate-700">{oppe.reviewCycle}</p>
                  <p className="text-xs text-slate-500">{oppe.totalCases} cases &middot; Rating: <span className="font-semibold">{oppe.overallRating}</span></p>
                </div>
              ))}
              <Link href={`/credentialing/oppe?provider=${provider.id}`} className="block mt-2 text-xs text-indigo-600 hover:underline">
                View All OPPE Records →
              </Link>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
