import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'] });
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nyxcitadel.com';

export function generateMetadata(): Metadata {
  return {
    title: {
      default: 'NyxCitadel | Compliance & Risk Management',
      template: '%s | NyxCitadel',
    },
    description:
      'Compliance, risk management, and emergency management platform - NyxCitadel.',
    metadataBase: new URL(appUrl),
    openGraph: {
      title: 'NyxCitadel | Compliance & Risk Management',
      description:
        'Compliance, risk management, and emergency management platform built for healthcare organizations.',
      url: appUrl,
      siteName: 'NyxCitadel',
      type: 'website',
      images: [
        {
          url: '/citadellogo-clean.png',
          width: 1200,
          height: 1200,
          alt: 'NyxCitadel',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'NyxCitadel | Compliance & Risk Management',
      description:
        'Compliance, risk management, and emergency management platform built for healthcare organizations.',
      images: ['/citadellogo-clean.png'],
    },
    icons: {
      icon: '/citadellogo-clean.png',
      shortcut: '/citadellogo-clean.png',
      apple: '/citadellogo-clean.png',
    },
    robots: { index: true, follow: true },
    other: {
      ...Sentry.getTraceData(),
    },
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
