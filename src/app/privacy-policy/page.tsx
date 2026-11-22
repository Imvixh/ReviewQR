import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

const siteUrl = getMarketingSiteUrl();

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn what information Revvly processes when a business creates a QR experience or a customer scans one.',
  alternates: siteUrl ? { canonical: new URL('/privacy-policy', siteUrl) } : undefined,
  openGraph: {
    title: 'Revvly Privacy Policy',
    description: 'Information about data used by the Revvly website and QR experience.',
    type: 'website',
    url: siteUrl ? new URL('/privacy-policy', siteUrl) : undefined,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MarketingHeader activePage="privacy" />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-36 sm:px-8 md:pt-32">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">Legal &amp; Trust</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-base leading-7 text-secondary sm:text-lg">How Revvly handles information when you create a QR or when a customer scans one.</p>
          <p className="mt-1 text-sm text-secondary">Last updated: November 2026</p>
        </header>

        <Link className="mb-8 inline-flex rounded-md font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/">
          ← Back to Home
        </Link>

        <article className="space-y-8 text-base leading-7 text-secondary sm:text-lg sm:leading-8">
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">1. About Revvly</h2>
            <p>Revvly is a QR-based tool for local businesses to create a customer review experience. This page describes information handled by the website and QR flow. For privacy questions, use the contact options on our <Link className="font-semibold text-primary underline" href="/contact">Contact page</Link>.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">2. Information businesses provide</h2>
            <p>When a business creates a QR, the service processes details such as business name, category, city, and the review destination supplied by the business. An account is required for saved business QR workflows; account information is handled by the authentication and database services used by Revvly.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">3. Information from customers who scan</h2>
            <p>A customer can open a public QR page without creating a Revvly account. The QR service records scan and destination-click events so the business can see QR activity. Customers may choose to enter text to request optional writing suggestions; that text is sent to the configured suggestion provider when the feature is available. Customers decide what to edit, copy, and submit to Google. Revvly does not collect Google account passwords or submit reviews on a customer’s behalf.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">4. Cookies and similar technologies</h2>
            <p>The website may use browser storage to support account sessions and core product functionality. You can manage cookies and site data in your browser settings; blocking required storage may prevent parts of the service from working.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">5. How information is used</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide account, QR creation, and public QR functionality.</li>
              <li>To record QR scan and destination-click activity for business analytics.</li>
              <li>To respond to support requests and maintain the service.</li>
              <li>To provide optional writing suggestions when that feature is configured and available.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">6. Service providers and sharing</h2>
            <p>Revvly relies on third-party infrastructure providers for functions such as authentication, database storage, hosting, and optional writing suggestions. Information may be processed by providers as needed to deliver those functions, or disclosed when required by law.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">7. Your choices</h2>
            <p>Customers choose whether to use the QR experience and whether to continue to Google. Businesses can ask for help with information associated with their account or QR by contacting us through the <Link className="font-semibold text-primary underline" href="/contact">Contact page</Link>. We will respond as reasonably practical and subject to applicable requirements.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-navy sm:text-2xl">8. Changes to this policy</h2>
            <p>If this policy changes materially, the revised version will be published on this page with an updated date.</p>
          </section>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
