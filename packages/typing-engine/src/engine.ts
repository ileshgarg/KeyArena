import {
  CharacterStatus,
  CharState,
  SecondTelemetry,
  TestDifficulty,
  TestMode,
  TestModifier,
  TypingEngineConfig,
  TypingTestResult,
  WordPerformance,
  WordState
} from './types';
import { calculateAccuracy, calculateConsistency, calculateIntervalConsistency, calculateRawWpm, calculateWpm } from './metrics';

export type EngineStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface EngineListener {
  onUpdate?: () => void;
  onSecondTick?: (telemetry: SecondTelemetry) => void;
  onComplete?: (result: TypingTestResult) => void;
  onFail?: (reason: string) => void;
}

export class TypingEngine {
  public config: TypingEngineConfig;
  public promptText: string = '';
  public words: WordState[] = [];
  public currentWordIndex: number = 0;
  public currentCharIndex: number = 0;
  public status: EngineStatus = 'idle';

  public startTime: number = 0;
  public endTime: number = 0;
  public elapsedMs: number = 0;

  // Keystroke statistics
  public totalKeystrokes: number = 0;
  public correctKeystrokes: number = 0;
  public incorrectKeystrokes: number = 0;
  public correctedErrors: number = 0;
  public extraCharsCount: number = 0;
  public missedCharsCount: number = 0;

  // Key tracking & analysis
  public keyErrorMap: Record<string, { total: number; errors: number }> = {};
  public keystrokeTimeline: Array<{ key: string; timeMs: number; isError: boolean }> = [];
  public intervalsMs: number[] = [];

  // Word-level performance
  public wordPerformances: WordPerformance[] = [];
  private currentWordStartTime: number = 0;
  private currentWordErrors: number = 0;

  // Second-by-second telemetry
  public secondTelemetry: SecondTelemetry[] = [];
  private lastTelemetrySecond: number = 0;

  private listeners: EngineListener[] = [];

  constructor(promptText: string, config: TypingEngineConfig) {
    this.config = config;
    this.setPrompt(promptText);
  }

  public addListener(listener: EngineListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public setPrompt(promptText: string) {
    this.promptText = promptText.trim();
    this.words = this.promptText.split(/\s+/).map((word) => ({
      original: word,
      chars: word.split('').map((c) => ({
        char: c,
        status: 'idle' as CharacterStatus
      })),
      isCompleted: false,
      hasErrors: false
    }));
    this.reset();
  }

  public reset() {
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.status = 'idle';
    this.startTime = 0;
    this.endTime = 0;
    this.elapsedMs = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.correctedErrors = 0;
    this.extraCharsCount = 0;
    this.missedCharsCount = 0;
    this.keyErrorMap = {};
    this.keystrokeTimeline = [];
    this.intervalsMs = [];
    this.wordPerformances = [];
    this.secondTelemetry = [];
    this.lastTelemetrySecond = 0;
    this.currentWordStartTime = 0;
    this.currentWordErrors = 0;

    // Reset char statuses
    for (const w of this.words) {
      w.isCompleted = false;
      w.hasErrors = false;
      w.chars = w.original.split('').map((c) => ({
        char: c,
        status: 'idle'
      }));
    }

    this.notifyUpdate();
  }

  public handleKey(key: string, now: number = Date.now()): void {
    if (this.status === 'completed' || this.status === 'failed') return;

    // Start on first valid keypress
    if (this.status === 'idle') {
      if (key.length > 1 && key !== 'Backspace' && key !== ' ') return;
      this.status = 'running';
      this.startTime = now;
      this.currentWordStartTime = now;
      this.lastTelemetrySecond = 0;
    }

    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) {
      this.completeTest(now);
      return;
    }

    // Interval tracking
    if (this.keystrokeTimeline.length > 0) {
      const prevTime = this.keystrokeTimeline[this.keystrokeTimeline.length - 1].timeMs;
      this.intervalsMs.push(now - prevTime);
    }

    const isNoBackspace = this.config.modifiers?.includes('no-backspace');

    if (key === 'Backspace') {
      if (isNoBackspace) return;
      this.handleBackspace(now);
      this.notifyUpdate();
      return;
    }

    // Space key: Word submission
    if (key === ' ' || key === 'Space') {
      this.handleSpace(now);
      this.notifyUpdate();
      return;
    }

    // Only accept single printable characters
    if (key.length !== 1) return;

    this.totalKeystrokes++;
    const expectedChar = currentWord.chars[this.currentCharIndex]?.char;
    const isCorrect = expectedChar === key;

    // Key error map tracking
    const keyLower = key.toLowerCase();
    if (!this.keyErrorMap[keyLower]) {
      this.keyErrorMap[keyLower] = { total: 0, errors: 0 };
    }
    this.keyErrorMap[keyLower].total++;
    if (!isCorrect) {
      this.keyErrorMap[keyLower].errors++;
    }

    this.keystrokeTimeline.push({
      key,
      timeMs: now,
      isError: !isCorrect
    });

    if (isCorrect) {
      this.correctKeystrokes++;
      if (this.currentCharIndex < currentWord.chars.length) {
        currentWord.chars[this.currentCharIndex].status = 'correct';
        currentWord.chars[this.currentCharIndex].userChar = key;
        this.currentCharIndex++;
      }
    } else {
      this.incorrectKeystrokes++;
      this.currentWordErrors++;
      currentWord.hasErrors = true;

      // Sudden death modifier check
      if (this.config.modifiers?.includes('sudden-death')) {
        this.failTest('Sudden Death triggered: mistyped character');
        return;
      }

      if (this.currentCharIndex < currentWord.chars.length) {
        currentWord.chars[this.currentCharIndex].status = 'incorrect';
        currentWord.chars[this.currentCharIndex].userChar = key;
        this.currentCharIndex++;
      } else {
        // Extra characters typed past word length
        this.extraCharsCount++;
        currentWord.chars.push({
          char: key,
          status: 'extra',
          userChar: key
        });
        this.currentCharIndex++;
      }
    }

    // Auto complete check for word mode or last character
    this.checkAutoCompletion(now);
    this.notifyUpdate();
  }

  private handleBackspace(now: number): void {
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    if (this.currentCharIndex > 0) {
      this.currentCharIndex--;
      const charState = currentWord.chars[this.currentCharIndex];

      if (charState.status === 'incorrect' || charState.status === 'extra') {
        this.correctedErrors++;
      }

      if (charState.status === 'extra') {
        currentWord.chars.splice(this.currentCharIndex, 1);
      } else {
        charState.status = 'idle';
        delete charState.userChar;
      }
    } else if (this.currentWordIndex > 0) {
      // Go back to previous word if it had errors
      const prevWord = this.words[this.currentWordIndex - 1];
      if (prevWord && prevWord.hasErrors) {
        this.currentWordIndex--;
        this.currentCharIndex = prevWord.chars.length;
        prevWord.isCompleted = false;
      }
    }
  }

  public handleCtrlBackspace(): void {
    if (this.config.modifiers?.includes('no-backspace')) return;
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    // Reset current word to idle
    currentWord.chars = currentWord.original.split('').map((c) => ({
      char: c,
      status: 'idle'
    }));
    this.currentCharIndex = 0;
    this.notifyUpdate();
  }

  private handleSpace(now: number): void {
    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    // Strict mode check: cannot skip word if has errors or incomplete
    const isStrict = this.config.modifiers?.includes('strict');
    const isWordComplete = this.currentCharIndex >= currentWord.original.length;
    const hasWordErrors = currentWord.hasErrors || currentWord.chars.some((c) => c.status === 'incorrect');

    if (isStrict && (!isWordComplete || hasWordErrors)) {
      return;
    }

    // Mark remaining untyped chars as missed
    if (this.currentCharIndex < currentWord.chars.length) {
      currentWord.hasErrors = true;
      for (let i = this.currentCharIndex; i < currentWord.chars.length; i++) {
        if (currentWord.chars[i].status === 'idle') {
          currentWord.chars[i].status = 'missed';
          this.missedCharsCount++;
        }
      }
    }

    currentWord.isCompleted = true;

    // Calculate word performance
    const wordDuration = Math.max(1, now - this.currentWordStartTime);
    const wordWpm = calculateWpm(currentWord.original.length, wordDuration);
    this.wordPerformances.push({
      word: currentWord.original,
      speedWpm: wordWpm,
      errorCount: this.currentWordErrors,
      durationMs: wordDuration
    });

    // Move to next word
    this.currentWordIndex++;
    this.currentCharIndex = 0;
    this.currentWordStartTime = now;
    this.currentWordErrors = 0;

    // Check completion
    if (this.currentWordIndex >= this.words.length) {
      this.completeTest(now);
    } else if (this.config.mode === 'words' && this.currentWordIndex >= (this.config.targetWordCount || 25)) {
      this.completeTest(now);
    }
  }

  private checkAutoCompletion(now: number): void {
    // If last word is finished completely with no extra/errors
    if (this.currentWordIndex === this.words.length - 1) {
      const lastWord = this.words[this.currentWordIndex];
      if (this.currentCharIndex === lastWord.original.length) {
        lastWord.isCompleted = true;
        const wordDuration = Math.max(1, now - this.currentWordStartTime);
        this.wordPerformances.push({
          word: lastWord.original,
          speedWpm: calculateWpm(lastWord.original.length, wordDuration),
          errorCount: this.currentWordErrors,
          durationMs: wordDuration
        });
        this.completeTest(now);
      }
    }
  }

  public tick(now: number = Date.now()): void {
    if (this.status !== 'running') return;

    this.elapsedMs = now - this.startTime;
    const currentSecond = Math.floor(this.elapsedMs / 1000);

    // Record per-second telemetry
    if (currentSecond > this.lastTelemetrySecond && currentSecond > 0) {
      this.lastTelemetrySecond = currentSecond;
      const currentWpm = this.getWpm(now);
      const currentRaw = this.getRawWpm(now);
      const currentAcc = this.getAccuracy();
      const currentErrors = this.incorrectKeystrokes + this.extraCharsCount + this.missedCharsCount;

      const item: SecondTelemetry = {
        second: currentSecond,
        wpm: currentWpm,
        rawWpm: currentRaw,
        accuracy: currentAcc,
        errors: currentErrors
      };
      this.secondTelemetry.push(item);

      for (const listener of this.listeners) {
        listener.onSecondTick?.(item);
      }
    }

    // Time mode expiration
    if (this.config.mode === 'time') {
      const targetDurationMs = (this.config.targetDuration || 30) * 1000;
      if (this.elapsedMs >= targetDurationMs) {
        this.completeTest(now);
        return;
      }
    }

    this.notifyUpdate();
  }

  public completeTest(now: number = Date.now()): TypingTestResult {
    this.status = 'completed';
    this.endTime = now;
    this.elapsedMs = Math.max(500, this.endTime - this.startTime);

    const result = this.generateResult();

    for (const listener of this.listeners) {
      listener.onComplete?.(result);
    }
    this.notifyUpdate();
    return result;
  }

  public failTest(reason: string): void {
    this.status = 'failed';
    this.endTime = Date.now();
    this.elapsedMs = Math.max(100, this.endTime - this.startTime);

    for (const listener of this.listeners) {
      listener.onFail?.(reason);
    }
    this.notifyUpdate();
  }

  public getWpm(now: number = Date.now()): number {
    const elapsed = this.status === 'running' ? now - this.startTime : this.elapsedMs;
    return calculateWpm(this.correctKeystrokes, elapsed);
  }

  public getRawWpm(now: number = Date.now()): number {
    const elapsed = this.status === 'running' ? now - this.startTime : this.elapsedMs;
    return calculateRawWpm(this.totalKeystrokes, elapsed);
  }

  public getAccuracy(): number {
    return calculateAccuracy(this.correctKeystrokes, this.totalKeystrokes);
  }

  public getTimeRemaining(): number {
    if (this.config.mode !== 'time') return 0;
    const targetMs = (this.config.targetDuration || 30) * 1000;
    const remaining = Math.max(0, targetMs - this.elapsedMs);
    return Math.ceil(remaining / 1000);
  }

  public getProgress(): number {
    if (this.config.mode === 'time') {
      const targetMs = (this.config.targetDuration || 30) * 1000;
      return Math.min(100, Math.round((this.elapsedMs / targetMs) * 100));
    }
    const totalWords = this.config.mode === 'words' ? (this.config.targetWordCount || 25) : this.words.length;
    return Math.min(100, Math.round((this.currentWordIndex / totalWords) * 100));
  }

  public generateResult(): TypingTestResult {
    const wpm = calculateWpm(this.correctKeystrokes, this.elapsedMs);
    const rawWpm = calculateRawWpm(this.totalKeystrokes, this.elapsedMs);
    const accuracy = calculateAccuracy(this.correctKeystrokes, this.totalKeystrokes);
    const consistency =
      this.secondTelemetry.length > 1
        ? calculateConsistency(this.secondTelemetry)
        : calculateIntervalConsistency(this.intervalsMs);

    const totalChars = this.promptText.length;
    const avgInterval =
      this.intervalsMs.length > 0
        ? Math.round(this.intervalsMs.reduce((a, b) => a + b, 0) / this.intervalsMs.length)
        : 0;

    const avgWordSpeed =
      this.wordPerformances.length > 0
        ? Math.round(
            (this.wordPerformances.reduce((acc, wp) => acc + wp.speedWpm, 0) /
              this.wordPerformances.length) *
              10
          ) / 10
        : wpm;

    const errorRate =
      this.totalKeystrokes > 0
        ? Math.round((this.incorrectKeystrokes / this.totalKeystrokes) * 1000) / 10
        : 0;

    return {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      wpm,
      rawWpm,
      netWpm: Math.max(0, wpm),
      accuracy,
      consistency,
      elapsedMs: this.elapsedMs,
      correctChars: this.correctKeystrokes,
      incorrectChars: this.incorrectKeystrokes,
      extraChars: this.extraCharsCount,
      missedChars: this.missedCharsCount,
      totalChars,
      totalKeystrokes: this.totalKeystrokes,
      wordsTyped: this.wordPerformances.length,
      errorRate,
      averageKeyIntervalMs: avgInterval,
      averageWordSpeedWpm: avgWordSpeed,
      secondTelemetry: [...this.secondTelemetry],
      keyErrorMap: { ...this.keyErrorMap },
      wordPerformance: [...this.wordPerformances],
      keystrokeTimeline: [...this.keystrokeTimeline],
      config: { ...this.config },
      completedAt: new Date().toISOString()
    };
  }

  private notifyUpdate(): void {
    for (const listener of this.listeners) {
      listener.onUpdate?.();
    }
  }
}
