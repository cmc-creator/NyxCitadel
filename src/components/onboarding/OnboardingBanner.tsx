import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { OnboardingBannerClient } from './OnboardingBannerClient';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const DISMISS_COOKIE = 'nyxcitadel-onboarding-dismissed';

interface Props {
  facilityId: string;
  userRole: string;
}

export async function OnboardingBanner({ facilityId, userRole }: Props) {
  // Only show to admins
  if (!ADMIN_ROLES.includes(userRole)) return null;

  // Check if dismissed
  const cookieStore = await cookies();
  if (cookieStore.get(DISMISS_COOKIE)?.value === '1') return null;

  // Detect setup completion in parallel
  const [facility, staffCount, calendarCount] = await Promise.all([
    prisma.facility.findUnique({
      where: { id: facilityId },
      select: { address: true, npi: true, phone: true },
    }),
    prisma.user.count({
      where: { facilityId, isActive: true },
    }),
    prisma.calendarEvent.count({
      where: { facilityId },
    }),
  ]);

  const facilityConfigured = !!(facility?.address || facility?.npi || facility?.phone);
  const templatesApplied   = calendarCount >= 5; // quick-start seeds ≥5 calendar events
  const teamInvited        = staffCount > 1;      // more than just the admin

  // If everything is done, don't show the banner
  if (facilityConfigured && templatesApplied && teamInvited) return null;

  const steps = [
    {
      id:    'facility',
      label: 'Configure facility',
      done:  facilityConfigured,
      href:  '/settings/facility',
    },
    {
      id:    'templates',
      label: 'Apply quick-start templates',
      done:  templatesApplied,
      href:  '/onboarding',
    },
    {
      id:    'team',
      label: 'Invite your team',
      done:  teamInvited,
      href:  '/settings/users',
    },
  ];

  return <OnboardingBannerClient steps={steps} />;
}
