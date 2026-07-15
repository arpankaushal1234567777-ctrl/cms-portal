import { Inter, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata = {
  title: 'DEI CMS Portal | Academic Records',
  description: 'Access Dayalbagh Educational Institute academic records, marks sheet, download admit cards, and get payment receipts using the secure and fast CMS portal.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'DEI CMS Portal | Academic Records',
    description: 'Check DEI marks and download admit cards securely.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#020617',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
