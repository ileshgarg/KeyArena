import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keyarena.org';

export const metadata: Metadata = {
  title: 'Typing Test FAQ — WPM Formulas, Speed Tiers & Shortcuts',
  description:
    'Learn how Words Per Minute (WPM) is calculated, how typing consistency is measured, standard speed benchmarks, and keyboard navigation shortcuts on KeyArena.',
  keywords: [
    'how is wpm calculated',
    'wpm formula',
    'typing test faq',
    'typing speed benchmarks',
    'average typing speed',
    'touch typing guide',
    'typing test accuracy formula'
  ],
  alternates: {
    canonical: `${siteUrl}/faq`
  },
  openGraph: {
    title: 'Typing Test FAQ — WPM Formulas, Speed Tiers & Shortcuts | KeyArena',
    description:
      'Learn how Words Per Minute (WPM) is calculated, how typing consistency is measured, standard speed benchmarks, and keyboard navigation shortcuts on KeyArena.',
    url: `${siteUrl}/faq`
  }
};

export default function FAQLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is WPM calculated on KeyArena?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Following standard typographical conventions, 1 word is defined as exactly 5 characters (including spaces and punctuation). WPM is calculated as (correct characters / 5) / (elapsed time in minutes). Raw WPM counts all keystrokes typed, regardless of errors.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to sign up or create an account to take a typing test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. KeyArena is strictly account-free. All tests, statistics, streak logs, and achievements are persisted securely in your browser using IndexedDB.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the Consistency metric in typing tests?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Consistency measures how uniform your typing velocity is across the duration of a test. It is derived from the standard deviation and coefficient of variation of your keystroke intervals and rolling per-second WPM. Higher consistency indicates smooth, rhythmic typing without stuttering.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I backup or transfer my typing statistics?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open Settings → Data Management & Privacy. Click "Export JSON" to download your full history, personal bests, and preferences. You can restore them on any other machine or browser with "Import JSON".'
        }
      },
      {
        '@type': 'Question',
        name: 'What keyboard shortcuts are available on KeyArena?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tab or Enter immediately restarts the test. Esc opens the Command Palette where you can switch modes, durations, or preferences without touching your mouse. Ctrl+Backspace deletes the currently active word.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
