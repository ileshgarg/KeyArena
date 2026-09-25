export interface ThemeColors {
  bgPrimary: string;
  bgSurface: string;
  bgSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  error: string;
  errorSubtle: string;
  caret: string;
  border: string;
}

export interface KeyArenaTheme {
  id: string;
  name: string;
  isCustom?: boolean;
  colors: ThemeColors;
}

export const MONOCHROME_THEME: KeyArenaTheme = {
  id: 'monochrome',
  name: 'Charcoal',
  colors: {
    bgPrimary: '#36454F',
    bgSurface: '#2b373f',
    bgSubtle: '#41525d',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    accent: '#ffffff',
    accentHover: '#f1f5f9',
    accentSubtle: '#41525d',
    error: '#ef4444',
    errorSubtle: '#5c2020',
    caret: '#ffffff',
    border: '#475a67'
  }
};

export const PRESET_THEMES: KeyArenaTheme[] = [MONOCHROME_THEME];

export function applyTheme(theme: KeyArenaTheme = MONOCHROME_THEME): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = MONOCHROME_THEME.colors;

  root.style.setProperty('--bg-primary', c.bgPrimary);
  root.style.setProperty('--bg-surface', c.bgSurface);
  root.style.setProperty('--bg-subtle', c.bgSubtle);
  root.style.setProperty('--text-primary', c.textPrimary);
  root.style.setProperty('--text-secondary', c.textSecondary);
  root.style.setProperty('--text-muted', c.textMuted);
  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--accent-hover', c.accentHover);
  root.style.setProperty('--accent-subtle', c.accentSubtle);
  root.style.setProperty('--error', c.error);
  root.style.setProperty('--error-subtle', c.errorSubtle);
  root.style.setProperty('--caret', c.caret);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--border-focus', c.accent);
}

