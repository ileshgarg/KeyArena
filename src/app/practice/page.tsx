'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { getAllTests } from '@/lib/db';
import { TypingTestResult } from '@keyarena/typing-engine';
import { saveSettings } from '@/lib/settings';
import {
  Target,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Hash
} from 'lucide-react';

const COMMON_BIWORDS = [
  'th', 'he', 'in', 'er', 're', 'on', 'at', 'en', 'nd', 'ti',
  'es', 'or', 'te', 'of', 'ed', 'is', 'it', 'al', 'ar', 'st',
  'to', 'nt', 'ng', 'se', 'ha', 'as', 'ou', 'io', 'le', 've',
  'ing', 'tion', 'ment', 'able', 'ness', 'ance', 'ence', 'ship'
];

export default function PracticePage() {
  const router = useRouter();
  const [tests, setTests] = useState<TypingTestResult[]>([]);
  const [activeTab, setActiveTab] = useState<'missed' | 'slow' | 'biwords' | 'charerrors'>('missed');

  useEffect(() => {
    getAllTests().then(setTests);
  }, []);

  // Analyze missed words across all historical tests
  const missedWordsAnalysis = useMemo(() => {
    const map: Record<string, number> = {};
    tests.forEach((t) => {
      t.wordPerformance.forEach((wp) => {
        if (wp.errorCount > 0) {
          const w = wp.word.toLowerCase().replace(/[^a-z]/g, '');
          if (w.length >= 2) {
            map[w] = (map[w] || 0) + wp.errorCount;
          }
        }
      });
    });

    return Object.entries(map)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [tests]);

  // Analyze slow words across all historical tests
  const slowWordsAnalysis = useMemo(() => {
    const map: Record<string, { totalSpeed: number; count: number }> = {};
    tests.forEach((t) => {
      t.wordPerformance.forEach((wp) => {
        const w = wp.word.toLowerCase().replace(/[^a-z]/g, '');
        if (w.length >= 3) {
          if (!map[w]) map[w] = { totalSpeed: 0, count: 0 };
          map[w].totalSpeed += wp.speedWpm;
          map[w].count++;
        }
      });
    });

    return Object.entries(map)
      .filter(([_, v]) => v.count >= 2)
      .map(([word, v]) => ({
        word,
        avgSpeed: Math.round(v.totalSpeed / v.count),
        count: v.count
      }))
      .sort((a, b) => a.avgSpeed - b.avgSpeed); // Slowest first
  }, [tests]);

  // Character-level error breakdown
  const charErrorsAnalysis = useMemo(() => {
    const map: Record<string, { total: number; errors: number }> = {};
    tests.forEach((t) => {
      if (t.keyErrorMap) {
        Object.entries(t.keyErrorMap).forEach(([k, v]) => {
          if (!map[k]) map[k] = { total: 0, errors: 0 };
          map[k].total += v.total;
          map[k].errors += v.errors;
        });
      }
    });

    return Object.entries(map)
      .filter(([_, v]) => v.total >= 5)
      .map(([key, v]) => ({
        key,
        errorRate: Math.round((v.errors / v.total) * 100),
        errors: v.errors,
        total: v.total
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
  }, [tests]);

  // Launch a focused practice session with custom text
  const launchPractice = (wordsList: string[]) => {
    if (wordsList.length === 0) return;
    // Repeat words to create a solid ~25-word training set
    const repeated: string[] = [];
    while (repeated.length < 25) {
      for (const w of wordsList) {
        if (repeated.length < 25) repeated.push(w);
      }
    }

    const passage = repeated.join(' ');
    // Save to settings as custom text and navigate to home
    saveSettings({
      mode: 'custom'
    });
    sessionStorage.setItem('keyarena_temp_custom_text', passage);
    router.push('/');
  };

  const launchBiwordPractice = (biword: string) => {
    // Generate words containing this biword
    const sampleWords = [
      'the', 'other', 'weather', 'together', 'path', 'method', 'author', 'northern', 'health', 'theory',
      'thinking', 'rhythm', 'breath', 'feather', 'python', 'strength', 'depth', 'leather', 'smooth', 'wealth'
    ].filter((w) => w.includes(biword));

    const finalWords = sampleWords.length >= 3 ? sampleWords : [biword, `${biword}ing`, `pre${biword}`, biword];
    launchPractice(finalWords);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Deliberate Practice Suite
              </h1>
              <p className="text-xs text-text-muted">
                Targeted drills based on actual historical typing errors and latency bottlenecks
              </p>
            </div>
          </div>
        </div>

        {/* Practice Categories Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3 mb-6 text-xs">
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'missed'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missed Words ({missedWordsAnalysis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slow')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'slow'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Slow Words ({slowWordsAnalysis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('biwords')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'biwords'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Biwords & N-Grams</span>
          </button>

          <button
            onClick={() => setActiveTab('charerrors')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'charerrors'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Error Breakdown</span>
          </button>
        </div>

        {/* Tab 1: Missed Words Drill */}
        {activeTab === 'missed' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-text-muted">
                Words where you incurred keystroke errors or uncorrected mistakes during real sessions.
              </p>
              {missedWordsAnalysis.length > 0 && (
                <button
                  onClick={() => launchPractice(missedWordsAnalysis.slice(0, 10).map((m) => m.word))}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent text-bg-primary text-xs font-semibold hover:bg-accent-hover transition-colors"
                >
                  <span>Practice Top 10 Missed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {missedWordsAnalysis.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {missedWordsAnalysis.slice(0, 24).map((item) => (
                  <div
                    key={item.word}
                    className="p-3 bg-bg-surface border border-border rounded flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-text-primary text-sm">{item.word}</span>
                      <span className="block text-[10px] text-error">{item.count} errors</span>
                    </div>
                    <button
                      onClick={() => launchPractice([item.word])}
                      className="p-1 rounded text-text-muted hover:text-accent hover:bg-bg-subtle"
                      title="Drill this word"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-bg-surface border border-border rounded text-xs text-text-muted">
                No mistake words recorded yet. As you type tests, errors will automatically populate here for deliberate training!
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Slow Words Drill */}
        {activeTab === 'slow' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-text-muted">
                Words where your individual typing speed dipped below your overall baseline.
              </p>
              {slowWordsAnalysis.length > 0 && (
                <button
                  onClick={() => launchPractice(slowWordsAnalysis.slice(0, 10).map((s) => s.word))}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent text-bg-primary text-xs font-semibold hover:bg-accent-hover transition-colors"
                >
                  <span>Practice Top Slow Words</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {slowWordsAnalysis.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slowWordsAnalysis.slice(0, 24).map((item) => (
                  <div
                    key={item.word}
                    className="p-3 bg-bg-surface border border-border rounded flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-text-primary text-sm">{item.word}</span>
                      <span className="block text-[10px] text-amber-400 font-medium">
                        {item.avgSpeed} WPM avg
                      </span>
                    </div>
                    <button
                      onClick={() => launchPractice([item.word])}
                      className="p-1 rounded text-text-muted hover:text-accent hover:bg-bg-subtle"
                      title="Drill this word"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-bg-surface border border-border rounded text-xs text-text-muted">
                Complete a few typing tests to establish individual word speed metrics.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Biwords & N-Grams */}
        {activeTab === 'biwords' && (
          <div>
            <p className="text-xs text-text-muted mb-4">
              Biwords and n-grams represent critical tactile motor transitions between consecutive keys. Select any transition to drill:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {COMMON_BIWORDS.map((bw) => (
                <button
                  key={bw}
                  onClick={() => launchBiwordPractice(bw)}
                  className="p-3 rounded bg-bg-surface border border-border hover:border-accent hover:bg-bg-subtle text-center transition-colors group"
                >
                  <span className="text-sm font-bold text-text-primary group-hover:text-accent">
                    {bw}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Character-Level Error Breakdown */}
        {activeTab === 'charerrors' && (
          <div>
            <p className="text-xs text-text-muted mb-4">
              Real error frequencies per key from your historical keystroke logs:
            </p>

            {charErrorsAnalysis.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {charErrorsAnalysis.map((item) => (
                  <div
                    key={item.key}
                    className="p-3 bg-bg-surface border border-border rounded flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded bg-bg-subtle border border-border flex items-center justify-center font-bold text-accent">
                        {item.key}
                      </span>
                      <div>
                        <span className="text-xs text-text-primary font-semibold">
                          {item.errorRate}% error
                        </span>
                        <span className="block text-[10px] text-text-muted">
                          {item.errors}/{item.total} keys
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-bg-surface border border-border rounded text-xs text-text-muted">
                Complete typing tests to build your personal character accuracy profile.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
