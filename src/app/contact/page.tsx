import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/marketing/ContactForm';
import ContactMethods from '@/components/marketing/ContactMethods';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

const siteUrl = getMarketingSiteUrl();

export const metadata: Metadata = {
  title: 'Contact Revvly Support',
  description: 'Contact the Revvly team for help setting up a QR review experience for your local business.',
  alternates: siteUrl ? { canonical: new URL('/contact', siteUrl) } : undefined,
  openGraph: {
    title: 'Contact Revvly Support',
    description: 'Get personal help setting up a QR review experience for your business.',
    type: 'website',
    url: siteUrl ? new URL('/contact', siteUrl) : undefined,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MarketingHeader activePage="contact" />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-36 sm:px-8 md:pt-32">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">Contact</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Talk to the Revvly Team</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
            Setting up Revvly for your restaurant, hotel, salon, store or clinic? We reply personally — no bots, no ticket queue.
          </p>
        </header>

        <Link className="mb-6 inline-flex rounded-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/">
          ← Back to Home
        </Link>
        <div className="space-y-5">
          <ContactMethods />
          <ContactForm />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
