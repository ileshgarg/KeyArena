'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { generatePrompt, SeededRandom, TypingEngineConfig } from '@keyarena/typing-engine';
import { getWordsForLanguage } from '@/lib/languages';
import { saveSettings } from '@/lib/settings';
import { getLocalProfile } from '@/lib/db';
import {
  Flame,
  Calendar,
  Share2,
  Play,
  Copy,
  Check,
  Trophy,
  ArrowLeft,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  date: string;
}

function ChallengeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState(false);
  const [customShareUrl, setCustomShareUrl] = useState('');
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>([]);

  // Daily challenge parameters (deterministic seed based on current date)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const rng = useMemo(() => new SeededRandom(`daily-${todayStr}`), [todayStr]);

  const dailyDuration = useMemo(() => {
    const options = [30, 60];
    return options[rng.nextInt(0, 1)];
  }, [rng]);

  const dailyPunctuation = useMemo(() => rng.next() > 0.4, [rng]);
  const dailyNumbers = useMemo(() => rng.next() > 0.5, [rng]);

  // Load local daily scores
  useEffect(() => {
    const storageKey = `keyarena_daily_${todayStr}`;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setLocalScores(JSON.parse(raw));
      } catch {}
    }
  }, [todayStr]);

  // Handle URL challenge parameters if any
  const sharedConfig = useMemo(() => {
    const c = searchParams.get('c');
    if (!c) return null;
    try {
      const decoded = JSON.parse(atob(c));
      return decoded as TypingEngineConfig;
    } catch {
      return null;
    }
  }, [searchParams]);

  const launchDailyChallenge = () => {
    const wordList = getWordsForLanguage('english', '1k');
    const prompt = generatePrompt({
      mode: 'time',
      targetDuration: dailyDuration,
      punctuation: dailyPunctuation,
      numbers: dailyNumbers,
      seed: `daily-${todayStr}`,
      wordList
    });

    saveSettings({
      mode: 'time',
      targetDuration: dailyDuration,
      punctuation: dailyPunctuation,
      numbers: dailyNumbers,
      modifiers: []
    });

    sessionStorage.setItem('keyarena_temp_custom_text', prompt);
    router.push('/');
  };

  const createShareableChallenge = (duration: number, punctuation: boolean, numbers: boolean) => {
    const config: TypingEngineConfig = {
      mode: 'time',
      targetDuration: duration,
      punctuation,
      numbers,
      language: 'english'
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}/challenge?c=${encoded}`;
    setCustomShareUrl(url);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Daily Arena & Custom Challenges
              </h1>
              <p className="text-xs text-text-muted">
                Synchronized daily challenges and shareable custom test configurations
              </p>
            </div>
          </div>
        </div>

        {/* Shared challenge banner if opened via link */}
        {sharedConfig && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/40 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">
                Custom Challenge Detected
              </span>
              <p className="text-xs text-text-secondary">
                Configuration: {sharedConfig.mode} {sharedConfig.targetDuration ? `${sharedConfig.targetDuration}s` : ''} • Punctuation: {sharedConfig.punctuation ? 'Yes' : 'No'} • Numbers: {sharedConfig.numbers ? 'Yes' : 'No'}
              </p>
            </div>
            <button
              onClick={() => {
                saveSettings({
                  mode: sharedConfig.mode,
                  targetDuration: sharedConfig.targetDuration || 30,
                  punctuation: !!sharedConfig.punctuation,
                  numbers: !!sharedConfig.numbers
                });
                router.push('/');
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded bg-accent text-bg-primary font-bold text-xs hover:bg-accent-hover transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Accept Challenge</span>
            </button>
          </div>
        )}

        {/* Daily Challenge Card */}
        <div className="bg-bg-surface border border-border rounded-lg p-6 mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 fill-current" />
                <span>Synchronized Worldwide Challenge</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Daily Sprint — {todayStr}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Every typist worldwide receives the identical seed, word order, and constraints today.
              </p>
            </div>

            <button
              onClick={launchDailyChallenge}
              className="flex items-center space-x-2 px-5 py-2.5 rounded bg-accent text-bg-primary font-bold text-xs hover:bg-accent-hover transition-colors shadow-lg shadow-accent/10"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Daily Challenge</span>
            </button>
          </div>

          {/* Daily Rules Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-bg-subtle/50 p-3 rounded border border-border">
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Duration</span>
              <span className="font-semibold text-text-primary">{dailyDuration} Seconds</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Punctuation</span>
              <span className="font-semibold text-text-primary">{dailyPunctuation ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Numbers</span>
              <span className="font-semibold text-text-primary">{dailyNumbers ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Language</span>
              <span className="font-semibold text-text-primary">English 1K</span>
            </div>
          </div>
        </div>

        {/* Custom Challenge Generator */}
        <div className="bg-bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
            Create Shareable Challenge Link
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Generate an instant challenge URL encoding exact parameters that friends can open and race against.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => createShareableChallenge(30, true, false)}
              className="px-3 py-2 rounded bg-bg-subtle border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            >
              30s + Punctuation
            </button>
            <button
              onClick={() => createShareableChallenge(60, true, true)}
              className="px-3 py-2 rounded bg-bg-subtle border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            >
              60s Pro (Punctuation + Numbers)
            </button>
            <button
              onClick={() => createShareableChallenge(15, false, false)}
              className="px-3 py-2 rounded bg-bg-subtle border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            >
              15s Pure Speed Sprint
            </button>
          </div>

          {customShareUrl && (
            <div className="mt-4 p-3 bg-bg-subtle rounded border border-border flex items-center justify-between">
              <span className="text-xs text-text-secondary truncate mr-4">
                {customShareUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(customShareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-accent text-bg-primary rounded text-xs font-semibold hover:bg-accent-hover"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-muted font-mono text-xs">
          Loading challenge arena...
        </div>
      }
    >
      <ChallengeContent />
    </Suspense>
  );
}
