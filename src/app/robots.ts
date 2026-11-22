import type { MetadataRoute } from 'next';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getMarketingSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/dashboard/', '/settings/', '/analytics/', '/my-qr-codes/', '/qr-studio/', '/create-qr/', '/business-profile/', '/super-admin/', '/qr/'],
    },
    sitemap: siteUrl ? new URL('/sitemap.xml', siteUrl).toString() : undefined,
  };
}
