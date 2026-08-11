import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sliders } from 'lucide-react';
import { FeatureControlCenter } from '@/components/settings/FeatureControlCenter';

export const metadata = { title: 'Feature Settings | NyxCitadel' };

export default async function FeatureSettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-500/30 text-teal-600 flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feature & Module Settings</h1>
          <p className="text-sm text-slate-500">Enable or disable specific AI tools, demo features, and compliance widgets.</p>
        </div>
      </div>

      <FeatureControlCenter />
    </div>
  );
}
