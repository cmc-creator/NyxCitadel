import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { AssistantChat } from '@/components/ai/assistant-chat';
import { WelcomeOnboarding } from '@/components/layout/WelcomeOnboarding';
import { WhatsNew } from '@/components/layout/WhatsNew';
import { SetupWizard } from '@/components/layout/SetupWizard';
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

  return (
    <div className="flex min-h-screen bg-background">
      <LayoutShell user={session.user}>
        {children}
      </LayoutShell>
      <WelcomeOnboarding userName={session.user.name} />
      <WhatsNew />
      <SetupWizard />
      <AssistantChat />
      <IdleTimeout />
    </div>
  );
}
