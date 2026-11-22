import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

const siteUrl = getMarketingSiteUrl();

export const metadata: Metadata = {
  title: 'About Revvly | QR Review Tools for Local Businesses',
  description: 'Learn why Revvly helps local businesses make it easier for customers to find and review their Google Business Profile.',
  alternates: siteUrl ? { canonical: new URL('/about', siteUrl) } : undefined,
  openGraph: {
    title: 'About Revvly',
    description: 'The story behind a simpler QR review experience for local businesses and their customers.',
    type: 'website',
    url: siteUrl ? new URL('/about', siteUrl) : undefined,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MarketingHeader activePage="about" />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-36 sm:px-8 md:pt-32">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">About Revvly</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Why Revvly Exists</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
            The story of a simple problem every local business knows — and a QR experience designed to make reviews easier to leave.
          </p>
        </header>

        <Link className="mb-8 inline-flex rounded-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/">
          ← Back to Home
        </Link>

        <article className="space-y-8 text-base leading-7 text-secondary sm:text-lg sm:leading-8">
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">It starts with a search</h2>
            <p>When people visit a new place, they often search online before choosing a hotel, salon, restaurant or nearby service. Customer feedback can help people understand what to expect and help businesses learn from real visits.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">But asking for a review can be awkward</h2>
            <p>After a good meal or a comfortable stay, asking a customer to find the right business listing and write a review adds several steps. Some customers are unsure what to write, so they put it off or leave nothing at all.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">A QR can make the next step clearer</h2>
            <p>Revvly helps a business create a QR experience that customers can open with their phone. The customer can choose whether to continue to Google, write in their own words, and submit from their own account. No app download or Revvly customer account is needed for the public scan experience.</p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-bold text-navy sm:text-2xl">Built on honest principles</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>No review gating or filtering: the QR experience does not route customers according to their rating.</li>
              <li>No fake reviews: customers choose what to write and submit from their own account.</li>
              <li>Customers stay in control of their words and whether they submit a review.</li>
            </ul>
          </section>
          <p>Questions about Revvly? Visit our <Link className="font-semibold text-primary underline" href="/contact">Contact page</Link>.</p>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
