import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'Settings & Typing Preferences',
  description:
    'Customize your typing test experience: sound effects (mechanical switch clicks), caret style, font, smooth caret scrolling, and JSON data export/import.',
  keywords: [
    'typing test settings',
    'mechanical keyboard typing sound',
    'custom typing test',
    'typing test preferences'
  ],
  alternates: {
    canonical: `${siteUrl}/settings`
  },
  openGraph: {
    title: 'Settings & Typing Preferences | KeyArena',
    description:
      'Customize your typing test experience: sound effects (mechanical switch clicks), caret style, font, smooth caret scrolling, and JSON data export/import.',
    url: `${siteUrl}/settings`
  }
};

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
