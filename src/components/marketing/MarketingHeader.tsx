import Image from 'next/image';
import Link from 'next/link';

type MarketingHeaderProps = {
  activePage?: 'home' | 'about' | 'contact' | 'privacy';
};

const sectionLinks = [
  ['Product', '/#product-slider'],
  ['How It Works', '/#how-it-works'],
  ['Features', '/#features'],
] as const;

export default function MarketingHeader({ activePage }: MarketingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline/70 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-4 py-2 sm:px-6 md:h-20 md:flex-nowrap md:px-12 md:py-0">
        <Link
          aria-current={activePage === 'home' ? 'page' : undefined}
          className="flex shrink-0 items-center rounded-xl px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href="/"
          aria-label="Revvly home"
        >
          <Image
            src="/revvly-logo.png"
            alt="Revvly"
            width={200}
            height={56}
            priority
            className="h-12 w-auto object-contain sm:h-14"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-xs font-medium text-secondary sm:gap-6 sm:text-sm md:order-none md:w-auto md:pb-0"
        >
          <Link
            aria-current={activePage === 'home' ? 'page' : undefined}
            className={`py-1 transition-colors hover:text-primary ${activePage === 'home' ? 'font-semibold text-tertiary' : ''}`}
            href="/"
          >
            Home
          </Link>
          {sectionLinks.map(([label, href]) => (
            <Link className="py-1 transition-colors hover:text-primary" href={href} key={label}>
              {label}
            </Link>
          ))}
          <Link
            aria-current={activePage === 'contact' ? 'page' : undefined}
            className={`py-1 transition-colors hover:text-primary ${activePage === 'contact' ? 'font-semibold text-tertiary' : ''}`}
            href="/contact"
          >
            Contact
          </Link>
          <Link
            aria-current={activePage === 'about' ? 'page' : undefined}
            className={`py-1 transition-colors hover:text-primary ${activePage === 'about' ? 'font-semibold text-tertiary' : ''}`}
            href="/about"
          >
            About
          </Link>
        </nav>

        <Link
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover sm:px-5 sm:py-2.5 sm:text-sm"
          href="/create-qr"
        >
          <span>Create Your QR</span>
          <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </header>
  );
}
