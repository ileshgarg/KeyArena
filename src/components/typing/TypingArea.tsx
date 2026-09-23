'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TypingEngine,
  TypingTestResult,
  SecondTelemetry
} from '@keyarena/typing-engine';
import { CaretStyle, CaretAnimation, FocusModeLevel } from '@/lib/settings';
import { soundEngine } from '@/lib/audio/sound-engine';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface TypingAreaProps {
  engine: TypingEngine;
  caretStyle?: CaretStyle;
  caretAnimation?: CaretAnimation;
  focusModeLevel?: FocusModeLevel;
  showLiveWpm?: boolean;
  showLiveAccuracy?: boolean;
  showTimer?: boolean;
  onComplete: (result: TypingTestResult) => void;
  onRestart: () => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyPress?: (key: string, isError: boolean) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  engine,
  caretStyle = 'line',
  caretAnimation = 'smooth',
  focusModeLevel = 'subtle',
  showLiveWpm = true,
  showLiveAccuracy = true,
  showTimer = true,
  onComplete,
  onRestart,
  onFocusChange,
  onKeyPress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [liveWpm, setLiveWpm] = useState(0);
  const [liveRawWpm, setLiveRawWpm] = useState(0);
  const [liveAcc, setLiveAcc] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [failedReason, setFailedReason] = useState<string | null>(null);

  // Caret coordinate tracking
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 28, width: 2 });

  // Update caret position from DOM
  const updateCaretPosition = useCallback(() => {
    if (!containerRef.current) return;
    const charEl = activeCharRef.current;
    if (charEl) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const charRect = charEl.getBoundingClientRect();

      setCaretPos({
        top: charRect.top - containerRect.top + containerRef.current.scrollTop,
        left: charRect.left - containerRect.left,
        height: charRect.height || 28,
        width: caretStyle === 'block' ? (charRect.width || 12) : 2
      });

      // Smooth auto-scroll if cursor moves to lower lines
      const relativeTop = charRect.top - containerRect.top;
      if (relativeTop > 120) {
        containerRef.current.scrollTop += relativeTop - 80;
      } else if (relativeTop < 20 && containerRef.current.scrollTop > 0) {
        containerRef.current.scrollTop = 0;
      }
    } else {
      setCaretPos({ top: 0, left: 0, height: 28, width: 2 });
    }
  }, [caretStyle]);

  // Reset all state cleanly when engine instance changes
  useEffect(() => {
    setLiveWpm(0);
    setLiveRawWpm(0);
    setLiveAcc(100);
    setTimeRemaining(engine.getTimeRemaining());
    setProgress(0);
    setIsTyping(false);
    setFailedReason(null);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
      hiddenInputRef.current.focus();
    }
    setIsInputFocused(true);
    updateCaretPosition();
  }, [engine, updateCaretPosition]);

  // Sync engine listeners
  useEffect(() => {
    const unsubscribe = engine.addListener({
      onUpdate: () => {
        setLiveWpm(Math.round(engine.getWpm()));
        setLiveRawWpm(Math.round(engine.getRawWpm()));
        setLiveAcc(Math.round(engine.getAccuracy()));
        setTimeRemaining(engine.getTimeRemaining());
        setProgress(engine.getProgress());
        updateCaretPosition();
      },
      onSecondTick: (t: SecondTelemetry) => {
        setLiveWpm(Math.round(t.wpm));
        setLiveRawWpm(Math.round(t.rawWpm));
        setLiveAcc(Math.round(t.accuracy));
      },
      onComplete: (result: TypingTestResult) => {
        soundEngine.playCompletion();
        setIsTyping(false);
        onFocusChange?.(false);
        onComplete(result);
      },
      onFail: (reason: string) => {
        soundEngine.playError();
        setFailedReason(reason);
        setIsTyping(false);
        onFocusChange?.(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [engine, onComplete, onFocusChange, updateCaretPosition]);

  // High-frequency tick loop for time mode
  useEffect(() => {
    if (engine.status === 'running') {
      setIsTyping(true);
      onFocusChange?.(true);

      timerIntervalRef.current = setInterval(() => {
        engine.tick(Date.now());
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [engine.status, engine, onFocusChange]);

  // Focus management
  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
    setIsInputFocused(true);
  }, []);

  // Window resize and auto-focus handler
  useEffect(() => {
    updateCaretPosition();
    focusInput();

    const handleResize = () => updateCaretPosition();
    const handleGlobalClick = () => {
      focusInput();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [updateCaretPosition, focusInput, engine.words]);

  // Core keystroke processor (shared between input onKeyDown and global window onKeyDown)
  const processKey = useCallback(
    (key: string, ctrlKey: boolean, preventDefault: () => void) => {
      if (engine.status === 'completed' || engine.status === 'failed') {
        if (key === 'Tab' || key === 'Enter') {
          preventDefault();
          onRestart();
        }
        return;
      }

      // Quick restart / change words shortcut: Enter or Tab at ANY time
      if (key === 'Enter' || key === 'Tab') {
        preventDefault();
        onRestart();
        return;
      }

      // Handle Ctrl+Backspace (word delete)
      if (ctrlKey && key === 'Backspace') {
        preventDefault();
        engine.handleCtrlBackspace();
        return;
      }

      // Normal input
      if (key === 'Backspace' || key === ' ' || key.length === 1) {
        if (key === ' ') preventDefault();

        const prevIncorrect = engine.incorrectKeystrokes;
        engine.handleKey(key, Date.now());

        const wasError = engine.incorrectKeystrokes > prevIncorrect;
        if (wasError) {
          soundEngine.playError();
        } else {
          soundEngine.playKey(key === ' ');
        }

        onKeyPress?.(key, wasError);
      }
    },
    [engine, onRestart, onKeyPress]
  );

  // Global window keydown fallback to guarantee keys NEVER get lost if user clicked outside
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Do not intercept if focus is inside an actual form field
      if (
        activeEl &&
        (activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl.tagName === 'INPUT' && activeEl !== hiddenInputRef.current))
      ) {
        return;
      }

      // Ignore lone modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        return;
      }

      // Allow Escape for command palette
      if (e.key === 'Escape') return;

      // If hidden input is already focused, let its own onKeyDown handle it
      if (document.activeElement === hiddenInputRef.current) {
        return;
      }

      // Ensure hidden input is focused immediately
      focusInput();

      // Process key immediately so this keypress is never lost
      processKey(e.key, e.ctrlKey, () => e.preventDefault());
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusInput, processKey]);

  // Keystroke handler for hidden input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    processKey(e.key, e.ctrlKey, () => e.preventDefault());
  };

  // Caret CSS classes
  const caretAnimClass =
    caretAnimation === 'blink'
      ? 'caret-blink'
      : caretAnimation === 'smooth'
      ? 'caret-smooth'
      : '';

  const isBlind = engine.config.modifiers?.includes('blind');

  return (
    <div
      className="w-full flex flex-col items-center select-none cursor-text"
      onClick={focusInput}
    >
      {/* Hidden input for physical and mobile keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -z-50 w-0 h-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Unfocused click-to-focus indicator */}
      {!isInputFocused && engine.status !== 'completed' && (
        <div className="text-xs font-mono text-accent mb-2 flex items-center space-x-1.5 animate-pulse">
          <span>Click here or press any key to focus</span>
        </div>
      )}

      {/* Live Telemetry Bar */}
      <div
        className={`w-full max-w-4xl flex items-center justify-between h-8 mb-3 px-2 font-mono text-sm transition-opacity duration-300 ${
          isTyping && focusModeLevel === 'full'
            ? 'opacity-0'
            : isTyping && focusModeLevel === 'subtle'
            ? 'opacity-60'
            : 'opacity-100'
        }`}
      >
        <div className="flex items-center space-x-6">
          {showTimer && engine.config.mode === 'time' && (
            <div className="text-accent font-bold text-lg">
              {timeRemaining}s
            </div>
          )}
          {engine.config.mode !== 'time' && (
            <div className="text-accent font-bold text-sm">
              {engine.currentWordIndex}/{engine.config.mode === 'words' ? (engine.config.targetWordCount || engine.words.length) : engine.words.length}
            </div>
          )}
          {showLiveWpm && engine.status === 'running' && (
            <div className="text-text-secondary">
              <span className="text-text-muted text-xs mr-1">wpm</span>
              <span className="font-semibold text-text-primary">{liveWpm}</span>
            </div>
          )}
          {showLiveAccuracy && engine.status === 'running' && (
            <div className="text-text-secondary">
              <span className="text-text-muted text-xs mr-1">acc</span>
              <span className="font-semibold text-text-primary">{liveAcc}%</span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <div className="w-24 h-1.5 bg-bg-surface border border-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Sudden Death / Failure State */}
      {failedReason && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded flex items-center justify-between text-xs font-mono text-red-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{failedReason}</span>
          </div>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setFailedReason(null);
              onRestart();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry (Tab)</span>
          </button>
        </div>
      )}

      {/* Core Typing Viewport */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-36 overflow-hidden focus:outline-none cursor-text font-mono text-2xl leading-relaxed tracking-wide select-none"
      >
        {/* Dynamic Caret */}
        {engine.status !== 'completed' && engine.status !== 'failed' && (
          <div
            className={`absolute pointer-events-none z-10 ${caretAnimClass}`}
            style={{
              top: `${caretPos.top}px`,
              left: `${caretPos.left}px`,
              height: caretStyle === 'underline' ? '3px' : `${caretPos.height}px`,
              width: `${caretPos.width}px`,
              backgroundColor: caretStyle === 'block' ? 'transparent' : 'var(--caret)',
              borderBottom: caretStyle === 'underline' ? '3px solid var(--caret)' : undefined,
              border: caretStyle === 'block' ? '2px solid var(--caret)' : undefined,
              marginTop: caretStyle === 'underline' ? `${caretPos.height - 4}px` : '0px'
            }}
          />
        )}

        {/* Word and Character Stream */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 py-1">
          {engine.words.map((word, wIdx) => {
            const isCurrentWord = wIdx === engine.currentWordIndex;
            return (
              <div
                key={wIdx}
                className={`relative inline-flex flex-nowrap ${
                  isCurrentWord ? 'active-word' : ''
                }`}
              >
                {word.chars.map((charState, cIdx) => {
                  const isCurrentChar =
                    isCurrentWord && cIdx === engine.currentCharIndex;

                  let statusColor = 'text-text-muted';
                  if (charState.status === 'correct') {
                    statusColor = 'text-text-primary';
                  } else if (charState.status === 'incorrect' || charState.status === 'missed') {
                    statusColor = isBlind ? 'text-text-muted' : 'text-error';
                  } else if (charState.status === 'extra') {
                    statusColor = isBlind ? 'text-text-muted' : 'text-red-400 bg-red-950/40 rounded-sm';
                  }

                  return (
                    <span
                      key={cIdx}
                      ref={isCurrentChar ? activeCharRef : null}
                      className={`relative font-mono transition-colors duration-75 ${statusColor}`}
                    >
                      {charState.char}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Quick Controls & Shortcuts */}
      <div
        className={`w-full max-w-4xl mt-6 flex items-center justify-center space-x-6 text-xs font-mono text-text-muted transition-opacity duration-300 ${
          isTyping ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRestart}
          className="flex items-center space-x-1.5 px-3 py-1 rounded hover:bg-bg-subtle hover:text-text-primary transition-colors border border-transparent hover:border-border"
          title="New Words / Restart (Enter or Tab)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>next words</span>
          <kbd className="text-[10px] bg-bg-subtle px-1.5 py-0.5 rounded border border-border ml-1">
            enter
          </kbd>
          <kbd className="text-[10px] bg-bg-subtle px-1.5 py-0.5 rounded border border-border">
            tab
          </kbd>
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-text-muted">
          <span>enter / tab to change words</span>
          <span>•</span>
          <span>esc to command palette</span>
          <span>•</span>
          <span>ctrl+backspace to delete word</span>
        </div>
      </div>
    </div>
  );
};
