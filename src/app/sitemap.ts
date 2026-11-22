import type { MetadataRoute } from 'next';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getMarketingSiteUrl();
  if (!siteUrl) return [];

  const routes = ['', '/contact', '/about', '/privacy-policy'];
  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.6,
  }));
}
