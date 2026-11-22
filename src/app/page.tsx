import type { Metadata } from 'next';
import LandingClient from './LandingClient';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

const siteUrl = getMarketingSiteUrl();

export const metadata: Metadata = {
  title: 'Google Review QR Codes for Local Businesses',
  description: 'Create a branded Google review QR experience for restaurants, hotels, salons, shops, and local services.',
  alternates: siteUrl ? { canonical: siteUrl } : undefined,
  openGraph: {
    title: 'Google Review QR Codes for Local Businesses | Revvly',
    description: 'Create a branded Google review QR experience for your local business.',
    type: 'website',
    url: siteUrl,
  },
};

export default function HomePage() {
  return <LandingClient />;
}
