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
import { ThemeModal } from '@/components/themes/ThemeModal';
import { getSettings, saveSettings } from '@/lib/settings';
import { getWordsForLanguage } from '@/lib/languages';
import { PRESET_THEMES, applyTheme } from '@/lib/themes';
import { saveTestResult, getAllTests } from '@/lib/db';

export default function HomePage() {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState(getSettings());
  const [isTypingFocus, setIsTypingFocus] = useState(false);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Test state
  const [testIteration, setTestIteration] = useState(1);
  const [currentResult, setCurrentResult] = useState<TypingTestResult | null>(null);
  const [isNewPb, setIsNewPb] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [isCustomTextModalOpen, setIsCustomTextModalOpen] = useState(false);

  // Load theme on startup
  useEffect(() => {
    const s = getSettings();
    setSettings(s);

    // Apply saved theme
    if (s.theme === 'custom_user') {
      const customRaw = localStorage.getItem('keyarena_custom_theme');
      if (customRaw) {
        try {
          applyTheme(JSON.parse(customRaw));
        } catch {
          applyTheme(PRESET_THEMES[0]);
        }
      }
    } else {
      const found = PRESET_THEMES.find((t) => t.id === s.theme);
      if (found) applyTheme(found);
    }
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
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
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
                modifiers={settings.modifiers}
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
              key={`${testIteration}_${settings.mode}_${settings.targetDuration}_${settings.targetWordCount}_${settings.difficulty}_${settings.language}_${settings.punctuation}_${settings.numbers}_${settings.modifiers.join(',')}`}
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

      {/* Theme Studio Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onThemeChanged={(themeId) => setSettings((s) => ({ ...s, theme: themeId }))}
      />
    </div>
  );
}
