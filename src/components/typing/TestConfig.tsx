'use client';

import React from 'react';
import {
  TestDifficulty,
  TestMode,
  TestModifier
} from '@keyarena/typing-engine';
import { ALL_LANGUAGES } from '@/lib/languages';
import { Globe, Clock, Type, Quote, Edit3, Sliders, ShieldAlert, EyeOff } from 'lucide-react';

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

  return (
    <div className={`w-full flex flex-col items-center gap-3 transition-opacity duration-200 ${disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
      {/* Primary Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-bg-surface border border-border rounded-md text-xs font-mono">
        {/* Mode buttons */}
        <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
          <button
            onClick={() => onChangeMode('time')}
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
            onClick={() => onChangeMode('words')}
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
            onClick={() => onChangeMode('quote')}
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
            onClick={() => onChangeMode('custom')}
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

        {/* Sub-mode Options */}
        {mode === 'time' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => onChangeDuration(d)}
                className={`px-2 py-1 rounded transition-colors ${
                  targetDuration === d
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {wordCounts.map((w) => (
              <button
                key={w}
                onClick={() => onChangeWordCount(w)}
                className={`px-2 py-1 rounded transition-colors ${
                  targetWordCount === w
                    ? 'text-accent font-semibold bg-bg-subtle'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {mode === 'quote' && (
          <div className="flex items-center space-x-1 border-r border-border pr-2 mr-1">
            {(['short', 'medium', 'long', 'random'] as const).map((q) => (
              <button
                key={q}
                onClick={() => onChangeQuoteLength(q)}
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
              onClick={onTogglePunctuation}
              className={`px-2 py-1 rounded transition-colors ${
                punctuation
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              @ punctuation
            </button>
            <button
              onClick={onToggleNumbers}
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
                onClick={() => onChangeDifficulty(d)}
                className={`px-1.5 py-0.5 rounded capitalize ${
                  difficulty === d
                    ? 'text-accent font-bold'
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
            onClick={() => onToggleModifier('sudden-death')}
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
            onClick={() => onToggleModifier('blind')}
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
            onClick={() => onToggleModifier('no-backspace')}
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
            onClick={() => onToggleModifier('strict')}
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
