import Image from 'next/image';
import Link from 'next/link';
import FooterContactActions from './FooterContactActions';

const footerLinkClass = 'transition-colors hover:text-primary';

export default function MarketingFooter() {
  return (
    <footer className="w-full border-t border-outline/60 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-10 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-4 sm:col-span-2">
            <Link className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/" aria-label="Revvly home">
              <Image src="/revvly-logo.png" alt="Revvly" width={220} height={62} className="h-14 w-auto object-contain sm:h-16" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-secondary">
              Create a branded QR experience that helps customers find your business review page and share feedback in their own words.
            </p>
            <FooterContactActions />
          </div>

          <div>
            <h2 className="mb-4 font-display text-sm font-bold text-on-surface">Product</h2>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li><Link className={footerLinkClass} href="/create-qr">Create Your QR</Link></li>
              <li><Link className={footerLinkClass} href="/#product-slider">Product overview</Link></li>
              <li><Link className={footerLinkClass} href="/#interactive-demo">Live demo</Link></li>
              <li><Link className={footerLinkClass} href="/#features">Features</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-display text-sm font-bold text-on-surface">Resources</h2>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li><Link className={footerLinkClass} href="/#how-it-works">How it works</Link></li>
              <li><Link className={footerLinkClass} href="/#faq">Frequently asked questions</Link></li>
              <li><Link className={footerLinkClass} href="/about">Our story</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-display text-sm font-bold text-on-surface">Company &amp; legal</h2>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li><Link className={footerLinkClass} href="/contact">Contact</Link></li>
              <li><Link className={footerLinkClass} href="/about">About Revvly</Link></li>
              <li><Link className={footerLinkClass} href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-outline/40 pt-6 text-center text-xs leading-5 text-secondary">
          <p className="font-semibold text-on-surface">Made with 💗 in India by Vishal Kumar</p>
          <p className="mt-1">Developed by Vishal Kumar</p>
          <p className="mt-3">
            © {new Date().getFullYear()} Revvly · revvly.in — Google, Google Maps and Android are trademarks of Google LLC. Revvly is an independent tool and is not endorsed by Google.
          </p>
        </div>
      </div>
    </footer>
  );
}
