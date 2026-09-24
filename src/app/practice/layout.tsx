import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'Deliberate Typing Practice & N-Gram Drills',
  description:
    'Master touch typing through targeted practice. Drill your most missed words, tricky n-grams, and common keyboard combinations with real-time accuracy telemetry.',
  keywords: [
    'touch typing practice',
    'typing drills',
    'n-gram typing practice',
    'missed words practice',
    'typing accuracy trainer',
    'improve typing speed',
    'deliberate typing practice'
  ],
  alternates: {
    canonical: `${siteUrl}/practice`
  },
  openGraph: {
    title: 'Deliberate Typing Practice & N-Gram Drills | KeyArena',
    description:
      'Master touch typing through targeted practice. Drill your most missed words, tricky n-grams, and common keyboard combinations with real-time accuracy telemetry.',
    url: `${siteUrl}/practice`
  }
};

export default function PracticeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
