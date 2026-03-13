import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { AssistantChat } from '@/components/ai/assistant-chat';
import { RegAlertBannerServer } from '@/components/layout/RegAlertBannerServer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar user={session.user} />
        <RegAlertBannerServer />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <AssistantChat />
    </div>
  );
}
