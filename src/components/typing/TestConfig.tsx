'use client';

import React, { useState } from 'react';
import {
  TestDifficulty,
  TestMode,
  TestModifier
} from '@keyarena/typing-engine';
import { ALL_LANGUAGES } from '@/lib/languages';
import { Globe, Clock, Type, Quote, Edit3, ShieldAlert, EyeOff } from 'lucide-react';

interface TestConfigProps {
  mode: TestMode;
  targetDuration: number;
  targetWordCount: number;
  language: string;
  difficulty: TestDifficulty;
  punctuation: boolean;
  numbers: boolean;
  modifiers: TestModifier[];
  quoteLength: 'short' | 'medium' | 'long' | 'random';
  onChangeMode: (mode: TestMode) => void;
  onChangeDuration: (seconds: number) => void;
  onChangeWordCount: (words: number) => void;
  onChangeLanguage: (langId: string) => void;
  onChangeDifficulty: (diff: TestDifficulty) => void;
  onTogglePunctuation: () => void;
  onToggleNumbers: () => void;
  onToggleModifier: (modifier: TestModifier) => void;
  onChangeQuoteLength: (len: 'short' | 'medium' | 'long' | 'random') => void;
  disabled?: boolean;
}

export const TestConfig: React.FC<TestConfigProps> = ({
  mode,
  targetDuration,
  targetWordCount,
  language,
  difficulty,
  punctuation,
  numbers,
  modifiers,
  quoteLength,
  onChangeMode,
  onChangeDuration,
  onChangeWordCount,
  onChangeLanguage,
  onChangeDifficulty,
  onTogglePunctuation,
  onToggleNumbers,
  onToggleModifier,
  onChangeQuoteLength,
  disabled = false
}) => {
  const durations = [15, 30, 60, 120];
  const wordCounts = [10, 25, 50, 100, 200];
  const difficulties: TestDifficulty[] = ['easy', 'normal', 'hard', 'expert'];

  const [isEditingCustomWords, setIsEditingCustomWords] = useState(false);
  const [customWordsInput, setCustomWordsInput] = useState('');
  const [isEditingCustomTime, setIsEditingCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');

  // Handle custom word count submission
  const submitCustomWords = () => {
    const val = parseInt(customWordsInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 1000) {
      onChangeWordCount(val);
    }
    setIsEditingCustomWords(false);
  };

  // Handle custom time submission
  const submitCustomTime = () => {
    const val = parseInt(customTimeInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 3600) {
      onChangeDuration(val);
    }
    setIsEditingCustomTime(false);
  };

  return (
    <div className={`w-full flex flex-col items-center gap-3 transition-opacity duration-200 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
      {/* Primary Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-bg-surface border border-border rounded-md text-xs font-mono">
        {/* Mode buttons */}
        <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeMode('time');
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
              mode === 'time'
                ? 'bg-bg-subtle text-accent font-medium'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeMode('words');
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
              mode === 'words'
                ? 'bg-bg-subtle text-accent font-medium'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>words</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeMode('quote');
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
              mode === 'quote'
                ? 'bg-bg-subtle text-accent font-medium'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>quote</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onChangeMode('custom');
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
              mode === 'custom'
                ? 'bg-bg-subtle text-accent font-medium'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>custom</span>
          </button>
        </div>

        {/* Sub-mode Options: Time */}
        {mode === 'time' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {durations.map((d) => (
              <button
                key={d}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsEditingCustomTime(false);
                  onChangeDuration(d);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  targetDuration === d && !isEditingCustomTime
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {d}s
              </button>
            ))}

            {isEditingCustomTime ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitCustomTime();
                }}
                className="inline-flex items-center"
              >
                <input
                  type="number"
                  min="5"
                  max="3600"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  onBlur={submitCustomTime}
                  autoFocus
                  placeholder="sec"
                  className="w-12 bg-bg-subtle border border-accent text-accent font-semibold px-1 py-0.5 rounded text-center text-xs focus:outline-none"
                />
              </form>
            ) : (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCustomTimeInput(targetDuration.toString());
                  setIsEditingCustomTime(true);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  !durations.includes(targetDuration)
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Set custom duration in seconds"
              >
                {!durations.includes(targetDuration) ? `${targetDuration}s` : 'custom'}
              </button>
            )}
          </div>
        )}

        {/* Sub-mode Options: Words */}
        {mode === 'words' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {wordCounts.map((w) => (
              <button
                key={w}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsEditingCustomWords(false);
                  onChangeWordCount(w);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  targetWordCount === w && !isEditingCustomWords
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {w}
              </button>
            ))}

            {isEditingCustomWords ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitCustomWords();
                }}
                className="inline-flex items-center"
              >
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={customWordsInput}
                  onChange={(e) => setCustomWordsInput(e.target.value)}
                  onBlur={submitCustomWords}
                  autoFocus
                  placeholder="words"
                  className="w-14 bg-bg-subtle border border-accent text-accent font-semibold px-1 py-0.5 rounded text-center text-xs focus:outline-none"
                />
              </form>
            ) : (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCustomWordsInput(targetWordCount.toString());
                  setIsEditingCustomWords(true);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  !wordCounts.includes(targetWordCount)
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Set custom word limit"
              >
                {!wordCounts.includes(targetWordCount) ? `${targetWordCount} words` : 'custom'}
              </button>
            )}
          </div>
        )}

        {/* Sub-mode Options: Quote */}
        {mode === 'quote' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {(['short', 'medium', 'long', 'random'] as const).map((q) => (
              <button
                key={q}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onChangeQuoteLength(q);
                }}
                className={`px-2 py-1 rounded capitalize transition-colors ${
                  quoteLength === q
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Modifiers (Punctuation & Numbers) */}
        {mode !== 'quote' && mode !== 'custom' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.currentTarget.blur();
                onTogglePunctuation();
              }}
              className={`px-2 py-1 rounded transition-colors ${
                punctuation
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              @ punctuation
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleNumbers();
              }}
              className={`px-2 py-1 rounded transition-colors ${
                numbers
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              # numbers
            </button>
          </div>
        )}

        {/* Language selector */}
        <div className="flex items-center space-x-1">
          <Globe className="w-3.5 h-3.5 text-text-muted ml-1" />
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="bg-transparent text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer py-1 px-1.5 text-xs font-mono"
          >
            {ALL_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-bg-surface text-text-primary">
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Modifier Bar: Difficulty & Experimental Rules */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-text-muted">
        {/* Difficulty */}
        {mode !== 'custom' && (
          <div className="flex items-center space-x-1 bg-bg-surface/60 border border-border px-2 py-0.5 rounded">
            <span className="text-text-muted">diff:</span>
            {difficulties.map((d) => (
              <button
                key={d}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onChangeDifficulty(d);
                }}
                className={`px-1.5 py-0.5 rounded capitalize transition-colors ${
                  difficulty === d
                    ? 'text-accent font-bold bg-accent/10'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Experimental Modifiers */}
        <div className="flex items-center space-x-1.5 bg-bg-surface/60 border border-border px-2 py-0.5 rounded">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleModifier('sudden-death');
            }}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition-colors ${
              modifiers.includes('sudden-death')
                ? 'text-red-400 font-semibold bg-red-950/40'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Sudden Death: single error fails test"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>sudden death</span>
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleModifier('blind');
            }}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition-colors ${
              modifiers.includes('blind')
                ? 'text-accent font-semibold bg-accent-subtle'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Blind: errors hidden until completion"
          >
            <EyeOff className="w-3 h-3" />
            <span>blind</span>
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleModifier('no-backspace');
            }}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              modifiers.includes('no-backspace')
                ? 'text-amber-400 font-semibold bg-amber-950/40'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="No Backspace allowed"
          >
            no backspace
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleModifier('strict');
            }}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              modifiers.includes('strict')
                ? 'text-purple-400 font-semibold bg-purple-950/40'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Strict: must fix all errors before moving forward"
          >
            strict
          </button>
        </div>
      </div>
    </div>
  );
};
