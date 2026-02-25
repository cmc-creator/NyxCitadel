import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Building2 } from 'lucide-react';

export const metadata = { title: 'Facility Configuration' };

export default async function FacilitySettingsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });

  if (!facility) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-600" />
          Facility Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          White-label branding, facility details, and regulatory identifiers.
        </p>
      </div>

      {/* Facility Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Facility Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-slate-500">Facility Name</dt>
              <dd className="text-sm font-medium text-slate-900 mt-0.5">{facility.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Short Name / Abbreviation</dt>
              <dd className="text-sm font-medium text-slate-900 mt-0.5">{facility.shortName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Facility Type</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{facility.facilityType.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Licensed Bed Count</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{facility.bedCount ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Address</dt>
              <dd className="text-sm text-slate-900 mt-0.5">
                {facility.address}<br />
                {facility.city}, {facility.state} {facility.zip}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Phone / Fax</dt>
              <dd className="text-sm text-slate-900 mt-0.5">
                {facility.phone ?? '—'} / {facility.fax ?? '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Regulatory IDs */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Regulatory Identifiers</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-slate-500">NPI (National Provider ID)</dt>
              <dd className="text-sm font-mono text-slate-900 mt-0.5">{facility.npi ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Medicare Provider #</dt>
              <dd className="text-sm font-mono text-slate-900 mt-0.5">{facility.medicareId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Medicaid Provider #</dt>
              <dd className="text-sm font-mono text-slate-900 mt-0.5">{facility.medicaidId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Joint Commission (AHCA) ID</dt>
              <dd className="text-sm font-mono text-slate-900 mt-0.5">{facility.jcAhcId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">AZ ADHS License #</dt>
              <dd className="text-sm font-mono text-slate-900 mt-0.5">{facility.licenseNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">License Expiry</dt>
              <dd className="text-sm text-slate-900 mt-0.5">
                {facility.licenseExpiry
                  ? new Date(facility.licenseExpiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Branding */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Branding (White-Label)</h2>
          <div className="flex items-center gap-6">
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-2">Primary Color</dt>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: facility.primaryColor }}
                />
                <span className="text-sm font-mono text-slate-700">{facility.primaryColor}</span>
              </div>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 mb-2">Secondary Color</dt>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: facility.secondaryColor }}
                />
                <span className="text-sm font-mono text-slate-700">{facility.secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-slate-400">
            To update facility information, contact your NyxCitadel system administrator or use the Admin API.
          </p>
        </div>
      </div>
    </div>
  );
}
