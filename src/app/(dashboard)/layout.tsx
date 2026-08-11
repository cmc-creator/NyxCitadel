import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { AssistantChat } from '@/components/ai/assistant-chat';
import { WelcomeOnboarding } from '@/components/layout/WelcomeOnboarding';
import { WhatsNew } from '@/components/layout/WhatsNew';
import { SetupWizard } from '@/components/layout/SetupWizard';
import { FeatureTour } from '@/components/onboarding/FeatureTour';
import { IdleTimeout } from '@/components/idle-timeout';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  // Subscription gating - redirect canceled facilities to billing page
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? '';
  const isBillingExempt =
    pathname.startsWith('/settings/billing') ||
    pathname.startsWith('/api/billing');

  if (!isBillingExempt) {
    const facility = await prisma.facility.findUnique({
      where: { id: session.user.facilityId },
      select: { subscriptionStatus: true },
    });
    if (facility?.subscriptionStatus === 'canceled') {
      redirect('/settings/billing?reason=canceled');
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <LayoutShell user={session.user}>
        {children}
      </LayoutShell>
      <WelcomeOnboarding userName={session.user.name} />
      <WhatsNew />
      <SetupWizard />
      <FeatureTour />
      <AssistantChat />
      <IdleTimeout />
    </div>
  );
}
