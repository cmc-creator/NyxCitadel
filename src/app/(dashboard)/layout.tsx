import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/DashboardShell';
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
    <DashboardShell user={session.user}>
      {children}
      <WelcomeOnboarding userName={session.user.name} />
      <WhatsNew />
      <SetupWizard />
      <AssistantChat />
      <IdleTimeout />
    </DashboardShell>
  );
}
