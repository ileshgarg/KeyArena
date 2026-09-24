import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'Typing Speed Leaderboard & Best WPM Records',
  description:
    'View top typing test speeds and personal records across 15s, 30s, 60s, and 120s modes. Compare your typing speed against competitive benchmarks.',
  keywords: [
    'typing leaderboard',
    'typing test high scores',
    'fastest wpm record',
    'competitive typing test',
    'typing speed ranking'
  ],
  alternates: {
    canonical: `${siteUrl}/leaderboard`
  },
  openGraph: {
    title: 'Typing Speed Leaderboard & Best WPM Records | KeyArena',
    description:
      'View top typing test speeds and personal records across 15s, 30s, 60s, and 120s modes. Compare your typing speed against competitive benchmarks.',
    url: `${siteUrl}/leaderboard`
  }
};

export default function LeaderboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
