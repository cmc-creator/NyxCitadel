import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import * as Sentry from '@sentry/nextjs';

const inter = Inter({ subsets: ['latin'] });

export function generateMetadata(): Metadata {
  return {
    title: {
      default: 'NyxCitadel | Compliance & Risk Management',
      template: '%s | NyxCitadel',
    },
    description:
      'Compliance, risk management, and emergency management platform - NyxCitadel.',
    icons: {
      icon: '/citadellogo.png',
      shortcut: '/citadellogo.png',
      apple: '/citadellogo.png',
    },
    robots: { index: false, follow: false },
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
