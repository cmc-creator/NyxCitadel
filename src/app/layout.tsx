import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nyxcitadel.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateMetadata(): Metadata {
  return {
    title: {
      default: 'NyxCitadel | Healthcare Compliance That Never Sleeps',
      template: '%s | NyxCitadel',
    },
    description:
      'The only healthcare compliance platform that never sleeps. CMS, Joint Commission, OSHA, and State DOH monitoring - automated alerts, CAP tracking, QAPI, and AI-powered survey readiness for behavioral health and acute care facilities.',
    metadataBase: new URL(appUrl),
    openGraph: {
      title: 'NyxCitadel | Healthcare Compliance That Never Sleeps',
      description:
        'Automated regulatory intelligence, survey readiness, QAPI, and AI-powered compliance management - built for behavioral health and acute psychiatric facilities.',
      url: appUrl,
      siteName: 'NyxCitadel',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'NyxCitadel | Healthcare Compliance That Never Sleeps',
      description:
        'Automated regulatory intelligence, survey readiness, QAPI, and AI-powered compliance management for behavioral health facilities.',
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/citadellogo-clean.png', type: 'image/png' },
      ],
      shortcut: '/favicon.svg',
      apple: '/citadellogo-clean.png',
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
