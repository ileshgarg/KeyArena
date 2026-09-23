'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { ArrowLeft, Shield, Zap, Keyboard, Award } from 'lucide-react';

export default function AboutPage() {
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
              About KeyArena
            </h1>
            <p className="text-xs text-text-muted">
              Engineering philosophy, architecture, and principles of deliberate typing practice
            </p>
          </div>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-text-secondary">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Core Product Principle</span>
            </h2>
            <p>
              KeyArena is a dedicated typing performance platform focused on speed, accuracy, consistency, and deliberate practice. We believe typing is a foundational motor discipline for programmers, writers, and technical operators. The application is built keyboard-first with an uncompromising dark-first aesthetic, zero advertisement clutter, and zero account friction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Zero-Auth Local Persistence</span>
            </h2>
            <p>
              KeyArena requires no login, no sign-up, and no email verification. All typing telemetry, personal bests, achievement unlocks, daily streaks, and custom theme designs are saved client-side directly into your browser's IndexedDB and localStorage. You can export and import your full history as clean JSON anytime from Settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-accent" />
              <span>Deliberate Practice Architecture</span>
            </h2>
            <p>
              Unlike traditional speed tests that merely test repetition, KeyArena records millisecond-accurate keypress intervals and error patterns. The Deliberate Practice Suite analyzes where your fingers slow down, highlights problematic character combinations (n-grams), and generates targeted drills to permanently eliminate tactile bottlenecks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4 text-accent" />
              <span>Competitive Races & Anti-Cheat</span>
            </h2>
            <p>
              KeyArena features real-time multiplayer races over WebSockets with anonymous temporary player IDs. A built-in anti-cheat validator inspects keystroke interval distributions to flag impossible mechanical speeds and synthetic macro injection, ensuring authentic competitive integrity.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
