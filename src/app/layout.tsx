import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'initialized.dev | GitHub Year in Review 2025',
  description: 'Transform your GitHub 2025 activity into a cinematic, interactive galactic dashboard.',
  openGraph: {
    title: 'initialized.dev | GitHub Year in Review 2025',
    description: 'Transform your GitHub 2025 activity into a cinematic, interactive galactic dashboard.',
    url: 'https://initialized.dev',
    siteName: 'initialized.dev',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'initialized.dev | GitHub Year in Review 2025',
    description: 'Transform your GitHub 2025 activity into a cinematic, interactive galactic dashboard.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BWW86HDEWM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BWW86HDEWM');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
