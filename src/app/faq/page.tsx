'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How is WPM calculated on KeyArena?',
      a: 'Following standard typographical conventions, 1 word is defined as exactly 5 characters (including spaces and punctuation). WPM is calculated as (correct characters / 5) / (elapsed time in minutes). Raw WPM counts all keystrokes typed, regardless of errors.'
    },
    {
      q: 'Do I need to sign up or create an account?',
      a: 'No. KeyArena is strictly account-free. All tests, statistics, streak logs, achievements, and custom themes are persisted securely in your browser using IndexedDB.'
    },
    {
      q: 'What is the Consistency metric?',
      a: 'Consistency measures how uniform your typing velocity is across the duration of a test. It is derived from the standard deviation and coefficient of variation of your keystroke intervals and rolling per-second WPM. Higher consistency indicates smooth, rhythmic typing without stuttering.'
    },
    {
      q: 'How do Daily Challenges work?',
      a: 'Every day at 00:00 UTC, a deterministic challenge seed is generated from the calendar date. Typists around the world receive the exact same word sequence and constraints, allowing fair asynchronous competition.'
    },
    {
      q: 'How do I backup or transfer my statistics?',
      a: 'Open Settings → Data Management & Privacy. Click "Export JSON" to download your full history, personal bests, and preferences. You can restore them on any other machine or browser with "Import JSON".'
    },
    {
      q: 'What keyboard shortcuts are available?',
      a: 'Tab or Enter immediately restarts the test. Esc opens the Command Palette where you can switch modes, change languages, or select themes without touching your mouse. Ctrl+Backspace deletes the currently active word.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center space-x-3 border-b border-border pb-4 mb-6">
          <Link
            href="/"
            className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs text-text-muted">
              Common questions regarding formulas, keyboard mechanics, and data storage
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-4 bg-bg-surface border border-border rounded-lg space-y-1.5">
              <h3 className="font-semibold text-text-primary flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5 text-accent" />
                <span>{item.q}</span>
              </h3>
              <p className="text-text-secondary leading-relaxed pl-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
