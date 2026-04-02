import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nyxcitadel.com';

  const routes = [
    '/',
    '/signup',
    '/login',
    '/guide',
    '/walkthrough',
    '/privacy',
    '/terms',
    '/contact',
    '/priority-partner-portal',
    '/priority-partner-portal/baa',
    '/priority-partner-portal/terms',
    '/priority-partner-portal/priority-partner-agreement',
    '/priority-partner-portal/lease-buy-options',
  ];

  const now = new Date();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
