'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TypingEngine,
  TypingEngineConfig,
  TypingTestResult,
  generatePrompt,
  TestMode,
  TestDifficulty,
  TestModifier
} from '@keyarena/typing-engine';
import { Header } from '@/components/navigation/Header';
import { TestConfig } from '@/components/typing/TestConfig';
import { TypingArea } from '@/components/typing/TypingArea';
import { ResultView } from '@/components/results/ResultView';
import { CommandPalette } from '@/components/palette/CommandPalette';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import { getWordsForLanguage } from '@/lib/languages';
import { applyTheme } from '@/lib/themes';
import { saveTestResult, getAllTests } from '@/lib/db';
import { Zap, Target, ShieldCheck, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isTypingFocus, setIsTypingFocus] = useState(false);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Test state
  const [testIteration, setTestIteration] = useState(1);
  const [currentResult, setCurrentResult] = useState<TypingTestResult | null>(null);
  const [isNewPb, setIsNewPb] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [isCustomTextModalOpen, setIsCustomTextModalOpen] = useState(false);

  // Load settings and apply monochrome theme on startup
  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    applyTheme();
  }, []);

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate current prompt (freshly randomized on every iteration or settings change)
  const currentPrompt = useMemo(() => {
    const wordList = getWordsForLanguage(settings.language, '1k');
    return generatePrompt({
      mode: settings.mode,
      targetDuration: settings.targetDuration,
      targetWordCount: settings.targetWordCount,
      wordList,
      punctuation: settings.punctuation,
      numbers: settings.numbers,
      difficulty: settings.difficulty,
      quoteLength: settings.quoteLength,
      seed: `${Date.now()}_${testIteration}_${Math.random()}`,
      customText: settings.mode === 'custom' ? customText : undefined
    });
  }, [
    settings.mode,
    settings.targetDuration,
    settings.targetWordCount,
    settings.language,
    settings.punctuation,
    settings.numbers,
    settings.difficulty,
    settings.quoteLength,
    customText,
    testIteration
  ]);

  // Engine instance
  const engine = useMemo(() => {
    const config: TypingEngineConfig = {
      mode: settings.mode,
      targetDuration: settings.targetDuration,
      targetWordCount: settings.targetWordCount,
      language: settings.language,
      difficulty: settings.difficulty,
      punctuation: settings.punctuation,
      numbers: settings.numbers,
      modifiers: settings.modifiers,
      customText: settings.mode === 'custom' ? customText : undefined
    };
    return new TypingEngine(currentPrompt, config);
  }, [currentPrompt, settings, customText]);

  // Restart handler to start next task with fresh words
  const handleRestart = useCallback(() => {
    setCurrentResult(null);
    setIsNewPb(false);
    setNewAchievements([]);
    setIsTypingFocus(false);

    // Clear one-off custom practice text if any
    if (customText) {
      setCustomText('');
      setSettings((prev) => {
        const updated = { ...prev, mode: 'time' as TestMode };
        saveSettings(updated);
        return updated;
      });
    }

    // Increment test iteration to guarantee new randomized words
    setTestIteration((prev) => prev + 1);
  }, [customText]);

  // Completion handler
  const handleComplete = useCallback(async (result: TypingTestResult) => {
    setCurrentResult(result);
    setIsTypingFocus(false);

    // Save to IndexedDB
    const { isNewPb: newPb, newAchievements: unlocked } = await saveTestResult(result);
    setIsNewPb(newPb);
    setNewAchievements(unlocked);
  }, []);

  // Practice missed words
  const handlePracticeMistakes = (words: string[]) => {
    if (words.length === 0) return;
    const prompt = words.join(' ');
    setCustomText(prompt);
    setSettings((prev) => {
      const updated = { ...prev, mode: 'custom' as TestMode };
      saveSettings(updated);
      return updated;
    });
    setCurrentResult(null);
    engine.setPrompt(prompt);
  };

  // Modifier and config updates
  const updateMode = (mode: TestMode) => {
    if (mode === 'custom' && !customText) {
      setIsCustomTextModalOpen(true);
      return;
    }
    const updated = saveSettings({ mode });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const updateDuration = (targetDuration: number) => {
    const updated = saveSettings({ targetDuration });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const updateWordCount = (targetWordCount: number) => {
    const updated = saveSettings({ targetWordCount });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const updateLanguage = (language: string) => {
    const updated = saveSettings({ language });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const updateDifficulty = (difficulty: TestDifficulty) => {
    const updated = saveSettings({ difficulty });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const togglePunctuation = () => {
    const updated = saveSettings({ punctuation: !settings.punctuation });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const toggleNumbers = () => {
    const updated = saveSettings({ numbers: !settings.numbers });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const toggleModifier = (mod: TestModifier) => {
    const exists = settings.modifiers.includes(mod);
    const updatedMods = exists
      ? settings.modifiers.filter((m) => m !== mod)
      : [...settings.modifiers, mod];
    const updated = saveSettings({ modifiers: updatedMods });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  const updateQuoteLength = (quoteLength: 'short' | 'medium' | 'long' | 'random') => {
    const updated = saveSettings({ quoteLength });
    setSettings(updated);
    setCurrentResult(null);
    setIsTypingFocus(false);
    setTestIteration((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      {/* Compact Technical Navigation */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isTypingFocus={isTypingFocus}
      />

      {/* Main Experience Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!currentResult ? (
          <div className="w-full flex flex-col items-center gap-8">
            {/* Top Mode & Modifier Controls */}
            <div
              className={`w-full transition-opacity duration-300 ${
                isTypingFocus ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <TestConfig
                mode={settings.mode}
                targetDuration={settings.targetDuration}
                targetWordCount={settings.targetWordCount}
                language={settings.language}
                difficulty={settings.difficulty}
                punctuation={settings.punctuation}
                numbers={settings.numbers}
                modifiers={settings.modifiers || []}
                quoteLength={settings.quoteLength}
                onChangeMode={updateMode}
                onChangeDuration={updateDuration}
                onChangeWordCount={updateWordCount}
                onChangeLanguage={updateLanguage}
                onChangeDifficulty={updateDifficulty}
                onTogglePunctuation={togglePunctuation}
                onToggleNumbers={toggleNumbers}
                onToggleModifier={toggleModifier}
                onChangeQuoteLength={updateQuoteLength}
                disabled={isTypingFocus}
              />
            </div>

            {/* Dominant Typing Area */}
            <TypingArea
              key={`${testIteration}_${settings.mode}_${settings.targetDuration}_${settings.targetWordCount}_${settings.difficulty}_${settings.language}_${settings.punctuation}_${settings.numbers}_${(settings.modifiers || []).join(',')}`}
              engine={engine}
              caretStyle={settings.caretStyle}
              caretAnimation={settings.caretAnimation}
              focusModeLevel={settings.focusMode}
              showLiveWpm={settings.showLiveWpm}
              showLiveAccuracy={settings.showLiveAccuracy}
              showTimer={settings.showTimer}
              onComplete={handleComplete}
              onRestart={handleRestart}
              onFocusChange={setIsTypingFocus}
            />

            {/* Semantic Crawlable Knowledge Base & SEO Guide */}
            <section
              aria-label="Typing Speed Test Guide and WPM Benchmarks"
              className={`w-full max-w-4xl mx-auto mt-16 pt-10 border-t border-border space-y-8 text-xs font-mono transition-opacity duration-300 ${
                isTypingFocus ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-lg bg-bg-surface border border-border space-y-2">
                  <div className="flex items-center space-x-2 text-text-primary font-semibold">
                    <Zap className="w-4 h-4 text-accent" />
                    <h2 className="text-sm">What is WPM?</h2>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    Words Per Minute (WPM) standardizes typing speed where 1 word equals 5 characters (including spaces). Net WPM counts correct characters, while raw WPM measures total keystrokes regardless of errors.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-surface border border-border space-y-2">
                  <div className="flex items-center space-x-2 text-text-primary font-semibold">
                    <Target className="w-4 h-4 text-accent" />
                    <h2 className="text-sm">Deliberate Practice</h2>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    Stop mindlessly re-typing easy paragraphs. KeyArena isolates your high-error keys, tricky n-grams, and missed words for targeted muscle memory drills to break through speed plateaus.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-surface border border-border space-y-2">
                  <div className="flex items-center space-x-2 text-text-primary font-semibold">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <h2 className="text-sm">Zero Account Friction</h2>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    100% private, client-side persistence with IndexedDB. No passwords, no trackers, no email spam. Your telemetry, streaks, and personal bests stay on your device with JSON backup.
                  </p>
                </div>
              </div>

              {/* Speed Benchmarks Table */}
              <div className="p-5 rounded-lg bg-bg-surface border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-accent" />
                    <span>Typing Speed Benchmarks (WPM Tiers)</span>
                  </h3>
                  <span className="text-[10px] text-text-muted">Standard 60s English Test</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-bg-subtle rounded border border-border/50">
                    <div className="text-text-muted text-[10px] uppercase tracking-wider">Beginner</div>
                    <div className="text-base font-bold text-text-primary mt-1">&lt; 40 WPM</div>
                    <p className="text-[11px] text-text-muted mt-1">Hunt-and-peck typists; looking at the keyboard.</p>
                  </div>
                  <div className="p-3 bg-bg-subtle rounded border border-border/50">
                    <div className="text-text-muted text-[10px] uppercase tracking-wider">Average</div>
                    <div className="text-base font-bold text-text-primary mt-1">40 – 60 WPM</div>
                    <p className="text-[11px] text-text-muted mt-1">Typical global office and casual computer user speed.</p>
                  </div>
                  <div className="p-3 bg-bg-subtle rounded border border-border/50">
                    <div className="text-text-muted text-[10px] uppercase tracking-wider">Professional</div>
                    <div className="text-base font-bold text-text-primary mt-1">60 – 90 WPM</div>
                    <p className="text-[11px] text-text-muted mt-1">Touch typists, software engineers, and transcribers.</p>
                  </div>
                  <div className="p-3 bg-bg-subtle rounded border border-accent/40 bg-accent/5">
                    <div className="text-accent text-[10px] uppercase tracking-wider font-semibold">Master</div>
                    <div className="text-base font-bold text-text-primary mt-1">90+ WPM</div>
                    <p className="text-[11px] text-text-secondary mt-1">Competitive keyboard enthusiasts &amp; speed typists.</p>
                  </div>
                </div>
              </div>

              {/* Formula & Shortcuts Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-lg bg-bg-surface border border-border space-y-2">
                  <h3 className="text-xs font-semibold text-text-primary">How WPM is Calculated</h3>
                  <div className="p-2.5 bg-bg-subtle rounded border border-border font-mono text-[11px] text-text-primary">
                    Net WPM = (Correct Characters ÷ 5) ÷ Elapsed Minutes
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Uncorrected errors subtract from gross keystroke velocity. KeyArena also logs standard deviation of keystroke intervals to measure Consistency (%).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-surface border border-border space-y-2">
                  <h3 className="text-xs font-semibold text-text-primary">Keyboard Shortcuts</h3>
                  <ul className="space-y-1.5 text-[11px] text-text-secondary">
                    <li className="flex justify-between items-center">
                      <span>Restart Test:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-primary">Tab</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Command Palette:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-primary">Esc</kbd>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Delete Active Word:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle border border-border text-text-primary">Ctrl + Backspace</kbd>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Results View with Accurate Telemetry Graph */
          <ResultView
            result={currentResult}
            isNewPb={isNewPb}
            newAchievements={newAchievements}
            onRestart={handleRestart}
            onPracticeMistakes={handlePracticeMistakes}
          />
        )}
      </main>

      {/* Custom Text Modal */}
      {isCustomTextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-bg-surface border border-border rounded-lg p-6 font-mono text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-text-primary mb-3">
              Enter Custom Text
            </h3>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your custom typing test passage here..."
              rows={6}
              className="w-full bg-bg-subtle border border-border rounded p-3 text-text-primary focus:outline-none focus:border-accent resize-none font-mono text-xs mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCustomTextModalOpen(false)}
                className="px-3 py-1.5 rounded text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customText.trim()) {
                    setIsCustomTextModalOpen(false);
                    updateMode('custom');
                  }
                }}
                disabled={!customText.trim()}
                className="px-4 py-1.5 rounded bg-accent text-bg-primary font-semibold hover:bg-accent-hover disabled:opacity-50"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette (Esc) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRestartTest={handleRestart}
        onChangeMode={updateMode}
        onChangeDuration={updateDuration}
        onChangeLanguage={updateLanguage}
        onTogglePunctuation={togglePunctuation}
        onToggleNumbers={toggleNumbers}
      />
    </div>
  );
}
