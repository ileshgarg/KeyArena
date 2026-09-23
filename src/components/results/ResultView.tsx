'use client';

import React, { useState } from 'react';
import { TypingTestResult } from '@keyarena/typing-engine';
import { RotateCcw, ArrowRight, Award, Trophy, Share2, Check } from 'lucide-react';

interface ResultViewProps {
  result: TypingTestResult;
  isNewPb?: boolean;
  newAchievements?: string[];
  onRestart: () => void;
  onPracticeMistakes?: (words: string[]) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  isNewPb = false,
  newAchievements = [],
  onRestart,
  onPracticeMistakes
}) => {
  const [copied, setCopied] = useState(false);
  const [activeGraphTab, setActiveGraphTab] = useState<'wpm' | 'accuracy' | 'errors'>('wpm');

  // Extract mistakes for deliberate practice
  const mistakeWords = result.wordPerformance
    .filter((wp) => wp.errorCount > 0)
    .map((wp) => wp.word);

  const copyResults = () => {
    const text = `KeyArena Typing Test Result:
${result.wpm} WPM • ${result.accuracy}% Acc • ${result.rawWpm} Raw • ${result.consistency}% Consistency
Mode: ${result.config.mode} • Duration: ${(result.elapsedMs / 1000).toFixed(1)}s`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut to start next task immediately upon pressing Enter or Tab
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  // Telemetry graph calculation
  const telemetry = result.secondTelemetry;
  const graphWidth = 720;
  const graphHeight = 180;
  const padding = 28;

  const maxSecond = telemetry.length > 0 ? telemetry[telemetry.length - 1].second : 1;
  const maxWpm = Math.max(60, ...telemetry.map((t) => Math.max(t.wpm, t.rawWpm))) + 10;

  const getX = (second: number) => {
    return padding + ((second - 1) / Math.max(1, maxSecond - 1)) * (graphWidth - padding * 2);
  };

  const getY = (val: number, maxVal: number) => {
    return graphHeight - padding - (val / Math.max(1, maxVal)) * (graphHeight - padding * 2);
  };

  const wpmPoints = telemetry.map((t) => `${getX(t.second)},${getY(t.wpm, maxWpm)}`).join(' ');
  const rawPoints = telemetry.map((t) => `${getX(t.second)},${getY(t.rawWpm, maxWpm)}`).join(' ');
  const accPoints = telemetry.map((t) => `${getX(t.second)},${getY(t.accuracy, 100)}`).join(' ');

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-6 select-none animate-fadeIn">
      {/* New Personal Record Banner */}
      {isNewPb && (
        <div className="flex items-center space-x-2 px-3 py-1 mb-4 rounded bg-accent/15 border border-accent/40 text-accent text-xs font-mono font-semibold">
          <Trophy className="w-4 h-4" />
          <span>New Personal Best!</span>
        </div>
      )}

      {/* Newly Unlocked Achievements */}
      {newAchievements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {newAchievements.map((ach, i) => (
            <div
              key={i}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Achievement Unlocked: {ach}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary Hero Metrics Typography (No AI Cards) */}
      <div className="w-full flex flex-wrap items-baseline justify-between border-b border-border pb-6 mb-6">
        <div>
          <div className="text-xs font-mono text-text-muted tracking-wider uppercase mb-1">
            typing speed
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="font-mono text-7xl font-bold tracking-tight text-accent">
              {result.wpm}
            </span>
            <span className="font-mono text-xl text-text-secondary">WPM</span>
          </div>
        </div>

        <div className="flex items-baseline space-x-8 sm:space-x-12 mt-4 sm:mt-0 font-mono">
          <div>
            <div className="text-xs text-text-muted tracking-wider uppercase mb-1">
              accuracy
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {result.accuracy}
              <span className="text-base text-text-muted font-normal">%</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted tracking-wider uppercase mb-1">
              raw wpm
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {result.rawWpm}
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted tracking-wider uppercase mb-1">
              consistency
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {result.consistency}
              <span className="text-base text-text-muted font-normal">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Performance Telemetry Graph */}
      <div className="w-full bg-bg-surface border border-border rounded-md p-4 mb-6">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-text-muted uppercase tracking-wider">
            keystroke telemetry
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-accent"></span>
              <span className="text-text-secondary">WPM</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-text-muted"></span>
              <span className="text-text-secondary">Raw</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              <span className="text-text-secondary">Errors</span>
            </div>
          </div>
        </div>

        {telemetry.length >= 2 ? (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="w-full h-44 overflow-visible font-mono text-[10px]"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding + ratio * (graphHeight - padding * 2);
                const val = Math.round(maxWpm * (1 - ratio));
                return (
                  <g key={idx}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={graphWidth - padding}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding - 6}
                      y={y + 3}
                      fill="var(--text-muted)"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Raw WPM Polyline */}
              <polyline
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                points={rawPoints}
              />

              {/* Net WPM Polyline */}
              <polyline
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                points={wpmPoints}
              />

              {/* Data points & error markers */}
              {telemetry.map((t, i) => {
                const cx = getX(t.second);
                const cy = getY(t.wpm, maxWpm);
                const prevErrors = i > 0 ? telemetry[i - 1].errors : 0;
                const errorDiff = t.errors - prevErrors;

                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="2.5" fill="var(--accent)" />
                    {errorDiff > 0 && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="none"
                        stroke="var(--error)"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs font-mono text-text-muted">
            Telemetry graph requires tests of 2 seconds or longer.
          </div>
        )}
      </div>

      {/* Technical Breakdown Statistics Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-bg-surface/50 border border-border rounded-md font-mono text-xs mb-6">
        <div>
          <span className="text-text-muted block mb-0.5">test type</span>
          <span className="text-text-primary capitalize">
            {result.config.mode}{' '}
            {result.config.mode === 'time'
              ? `${result.config.targetDuration}s`
              : result.config.mode === 'words'
              ? `${result.config.targetWordCount} words`
              : ''}
          </span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">characters</span>
          <span className="text-text-primary">
            <span className="text-text-primary font-semibold">{result.correctChars}</span> /{' '}
            <span className="text-error">{result.incorrectChars}</span> /{' '}
            <span className="text-text-muted">{result.extraChars}</span> /{' '}
            <span className="text-text-muted">{result.missedChars}</span>
          </span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">avg key interval</span>
          <span className="text-text-primary">{result.averageKeyIntervalMs} ms</span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">time elapsed</span>
          <span className="text-text-primary">
            {(result.elapsedMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">language</span>
          <span className="text-text-primary capitalize">{result.config.language || 'English'}</span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">difficulty</span>
          <span className="text-text-primary capitalize">{result.config.difficulty || 'Normal'}</span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">words typed</span>
          <span className="text-text-primary">{result.wordsTyped}</span>
        </div>

        <div>
          <span className="text-text-muted block mb-0.5">error rate</span>
          <span className="text-text-primary">{result.errorRate}%</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={onRestart}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Test (Tab / Enter)</span>
          </button>

          {mistakeWords.length > 0 && onPracticeMistakes && (
            <button
              onClick={() => onPracticeMistakes(mistakeWords)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-bg-surface hover:bg-bg-subtle border border-border text-text-secondary hover:text-text-primary transition-colors"
              title="Practice words you made mistakes on in this test"
            >
              <span>Practice {mistakeWords.length} Missed Words</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={copyResults}
          className="flex items-center space-x-1.5 px-3 py-2 rounded bg-bg-surface hover:bg-bg-subtle border border-border text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
