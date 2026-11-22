import type { Metadata } from 'next';
import './globals.css';
import { getMarketingSiteUrl } from '@/lib/marketing-site';

const siteUrl = getMarketingSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'Revvly | Google Review QR Codes for Local Businesses',
    template: '%s | Revvly',
  },
  description:
    'Create a QR review experience for your local business and make it easier for customers to find your Google review page.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/revvly-icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/revvly-icon.png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary-light selection:text-primary">
        {children}
      </body>
    </html>
  );
}
