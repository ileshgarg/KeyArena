import { TestDifficulty, TestMode, TestModifier } from '@keyarena/typing-engine';
import { SoundConfig, DEFAULT_SOUND_CONFIG } from '../audio/sound-engine';

export type CaretStyle = 'line' | 'block' | 'underline';
export type CaretAnimation = 'smooth' | 'blink' | 'static';
export type FocusModeLevel = 'off' | 'subtle' | 'full';

export interface KeyArenaSettings {
  mode: TestMode;
  targetDuration: number;
  targetWordCount: number;
  quoteLength: 'short' | 'medium' | 'long' | 'random';
  language: string;
  difficulty: TestDifficulty;
  punctuation: boolean;
  numbers: boolean;
  modifiers: TestModifier[];
  theme: string;
  caretStyle: CaretStyle;
  caretAnimation: CaretAnimation;
  focusMode: FocusModeLevel;
  sounds: SoundConfig;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showTimer: boolean;
  showKeyVisualizer: boolean;
  keyboardLayout: 'qwerty' | 'qwertz' | 'azerty' | 'dvorak' | 'colemak';
}

export const DEFAULT_SETTINGS: KeyArenaSettings = {
  mode: 'time',
  targetDuration: 30,
  targetWordCount: 25,
  quoteLength: 'medium',
  language: 'english',
  difficulty: 'normal',
  punctuation: false,
  numbers: false,
  modifiers: [],
  theme: 'monochrome',
  caretStyle: 'line',
  caretAnimation: 'smooth',
  focusMode: 'subtle',
  sounds: DEFAULT_SOUND_CONFIG,
  showLiveWpm: true,
  showLiveAccuracy: true,
  showTimer: true,
  showKeyVisualizer: false,
  keyboardLayout: 'qwerty'
};

const SETTINGS_KEY = 'keyarena_settings';

export function getSettings(): KeyArenaSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<KeyArenaSettings>): KeyArenaSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}
