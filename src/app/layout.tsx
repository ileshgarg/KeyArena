import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Footer } from '@/components/navigation/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KeyArena — Serious Typing Speed Test & WPM Platform',
    template: '%s | KeyArena'
  },
  description:
    'Free online typing speed test and keyboard practice platform. Test your WPM, accuracy, and consistency across 15s, 30s, 60s, and 120s modes. Zero account friction, deep telemetry, deliberate practice drills, and 100% private local storage.',
  keywords: [
    'typing test',
    'typing speed test',
    'wpm test',
    'words per minute test',
    '1 minute typing test',
    '60 second typing test',
    'online typing test',
    'free typing test',
    'keyboard speed test',
    'touch typing practice',
    'typing practice online',
    'typing test english',
    'keyboard typing practice',
    'monkeytype alternative',
    'typing test for programmers',
    'typing accuracy calculator',
    'how to type faster',
    'speed typing test',
    'wpm calculator',
    'keyarena'
  ],
  authors: [{ name: 'KeyArena Team', url: siteUrl }],
  creator: 'KeyArena',
  publisher: 'KeyArena',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['en_GB', 'en_IN', 'en_CA', 'en_AU', 'en_PH'],
    url: siteUrl,
    siteName: 'KeyArena',
    title: 'KeyArena — Serious Typing Speed Test & WPM Platform',
    description:
      'Fast, minimalist, distraction-free typing speed test. Test WPM, raw keystroke velocity, accuracy, and consistency with deliberate practice drills.',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'KeyArena — Serious Typing Performance Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeyArena — Serious Typing Speed Test & WPM Platform',
    description:
      'Free, minimalist typing speed test. Track WPM, raw speed, accuracy, and consistency without account requirements.',
    images: [`${siteUrl}/opengraph-image`]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
      'en-GB': siteUrl,
      'en-IN': siteUrl,
      'en-CA': siteUrl,
      'en-AU': siteUrl,
      'en-PH': siteUrl,
      'x-default': siteUrl
    }
  },
  category: 'technology'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#app`,
        name: 'KeyArena',
        url: siteUrl,
        description:
          'A minimalist, keyboard-first typing speed test and performance platform with deep telemetry, zero account friction, and deliberate practice drills.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript and HTML5 support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: [
          '15s, 30s, 60s, and 120s WPM Typing Tests',
          'Word Count Tests (10, 25, 50, 100, 200 words)',
          'Deliberate Practice Suite for Missed Words and N-Grams',
          'Millisecond-Accurate Keystroke Interval Telemetry',
          'Zero Account Requirement with IndexedDB Local Persistence',
          'Procedural Web Audio Mechanical Switch Sound Synthesis',
          'High-Contrast OLED Minimalist Dark Theme'
        ]
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'KeyArena',
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        sameAs: ['https://github.com/ileshgarg/KeyArena']
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary antialiased selection:bg-accent/30 selection:text-text-primary">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
