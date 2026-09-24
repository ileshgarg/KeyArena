import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'About KeyArena — Minimalist High-Performance Typing Platform',
  description:
    'KeyArena is an open, private, zero-auth typing platform engineered for competitive typists, programmers, and enthusiasts striving for speed and accuracy.',
  keywords: [
    'about keyarena',
    'open source typing test',
    'minimalist typing test',
    'monkeytype alternative',
    'privacy typing test'
  ],
  alternates: {
    canonical: `${siteUrl}/about`
  },
  openGraph: {
    title: 'About KeyArena — Minimalist High-Performance Typing Platform',
    description:
      'KeyArena is an open, private, zero-auth typing platform engineered for competitive typists, programmers, and enthusiasts striving for speed and accuracy.',
    url: `${siteUrl}/about`
  }
};

export default function AboutLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
