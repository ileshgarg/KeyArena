import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'Typing Speed Statistics & Performance Telemetry',
  description:
    'Analyze your typing performance with detailed graphs of WPM, accuracy, consistency, keystroke burst speed, and per-key error distributions.',
  keywords: [
    'typing statistics',
    'typing analytics',
    'wpm tracker',
    'typing speed graph',
    'keystroke dynamics',
    'typing consistency calculator'
  ],
  alternates: {
    canonical: `${siteUrl}/stats`
  },
  openGraph: {
    title: 'Typing Speed Statistics & Performance Telemetry | KeyArena',
    description:
      'Analyze your typing performance with detailed graphs of WPM, accuracy, consistency, keystroke burst speed, and per-key error distributions.',
    url: `${siteUrl}/stats`
  }
};

export default function StatsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
