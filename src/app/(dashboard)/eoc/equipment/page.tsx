import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EquipmentClient } from '@/components/eoc/equipment-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Equipment PM' };

export default async function EquipmentPmPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const equipment = await prisma.equipmentPm.findMany({
    where: { facilityId },
    orderBy: [{ status: 'asc' }, { nextServiceDate: 'asc' }],
  });

  const items = equipment.map(e => ({
    id: e.id,
    equipmentName: e.equipmentName,
    equipmentId: e.equipmentId,
    location: e.location,
    category: String(e.category),
    frequency: String(e.frequency),
    lastServiceDate: e.lastServiceDate
      ? e.lastServiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    nextServiceDate: e.nextServiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    vendor: e.vendor,
    contactPhone: e.contactPhone,
    status: String(e.status),
    notes: e.notes,
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-muted-foreground/70 hover:text-slate-300">Environment of Care</Link>
            <span className="text-muted-foreground">›</span>
            <span className="text-sm text-foreground font-medium">Equipment PM</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Equipment Preventive Maintenance</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">Fire systems, utilities, HVAC, elevators, and clinical support equipment schedules</p>
        </div>
        <Link href="/eoc/equipment/new" className="px-3 py-1.5 text-sm rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors">
          + Add Equipment
        </Link>
      </div>

      <EquipmentClient items={items} />
    </div>
  );
}

