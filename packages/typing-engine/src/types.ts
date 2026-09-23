export type TestMode = 'time' | 'words' | 'quote' | 'custom';
export type TestDifficulty = 'easy' | 'normal' | 'hard' | 'expert';
export type TestModifier =
  | 'punctuation'
  | 'numbers'
  | 'blind'
  | 'sudden-death'
  | 'strict'
  | 'no-backspace'
  | 'time-attack';

export type CharacterStatus = 'idle' | 'correct' | 'incorrect' | 'extra' | 'missed';

export interface CharState {
  char: string;
  status: CharacterStatus;
  userChar?: string;
}

export interface WordState {
  original: string;
  chars: CharState[];
  isCompleted: boolean;
  hasErrors: boolean;
}

export interface KeystrokeRecord {
  key: string;
  timestampMs: number;
  expectedChar: string;
  isCorrect: boolean;
  charIndex: number;
  wordIndex: number;
}

export interface TypingEngineConfig {
  mode: TestMode;
  targetDuration?: number; // In seconds (e.g. 15, 30, 60, 120)
  targetWordCount?: number; // In words (e.g. 10, 25, 50, 100, 200)
  language?: string;
  difficulty?: TestDifficulty;
  punctuation?: boolean;
  numbers?: boolean;
  modifiers?: TestModifier[];
  quoteId?: string;
  customText?: string;
}

export interface SecondTelemetry {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
  accuracy: number;
}

export interface WordPerformance {
  word: string;
  speedWpm: number;
  errorCount: number;
  durationMs: number;
}

export interface TypingTestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  consistency: number;
  elapsedMs: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  totalKeystrokes: number;
  wordsTyped: number;
  errorRate: number;
  averageKeyIntervalMs: number;
  averageWordSpeedWpm: number;
  secondTelemetry: SecondTelemetry[];
  keyErrorMap: Record<string, { total: number; errors: number }>;
  wordPerformance: WordPerformance[];
  keystrokeTimeline: Array<{ key: string; timeMs: number; isError: boolean }>;
  config: TypingEngineConfig;
  completedAt: string;
  isSuddenDeathFailed?: boolean;
}
