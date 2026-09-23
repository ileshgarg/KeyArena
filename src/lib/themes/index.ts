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

export const PRESET_THEMES: KeyArenaTheme[] = [
  {
    id: 'graphite',
    name: 'Graphite',
    colors: {
      bgPrimary: '#0d0f12',
      bgSurface: '#14181f',
      bgSubtle: '#1b202a',
      textPrimary: '#e6edf3',
      textSecondary: '#9ca7b8',
      textMuted: '#4f596a',
      accent: '#00F700',
      accentHover: '#00d900',
      accentSubtle: '#003800',
      error: '#ef4444',
      errorSubtle: '#451212',
      caret: '#00F700',
      border: '#232936'
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    colors: {
      bgPrimary: '#0a0d0a',
      bgSurface: '#101710',
      bgSubtle: '#182418',
      textPrimary: '#38ef7d',
      textSecondary: '#27ae60',
      textMuted: '#1b5e20',
      accent: '#00ff66',
      accentHover: '#00cc52',
      accentSubtle: '#0d381e',
      error: '#ff3333',
      errorSubtle: '#3d0d0d',
      caret: '#00ff66',
      border: '#1f3824'
    }
  },
  {
    id: 'amber',
    name: 'Amber CRT',
    colors: {
      bgPrimary: '#120f0a',
      bgSurface: '#1a160f',
      bgSubtle: '#262016',
      textPrimary: '#fbbf24',
      textSecondary: '#d97706',
      textMuted: '#78350f',
      accent: '#f59e0b',
      accentHover: '#d97706',
      accentSubtle: '#451a03',
      error: '#f87171',
      errorSubtle: '#450a0a',
      caret: '#f59e0b',
      border: '#3b2d18'
    }
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      bgPrimary: '#0f172a',
      bgSurface: '#1e293b',
      bgSubtle: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#60a5fa',
      accentHover: '#3b82f6',
      accentSubtle: '#172554',
      error: '#f43f5e',
      errorSubtle: '#4c0519',
      caret: '#60a5fa',
      border: '#334155'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      bgPrimary: '#05070e',
      bgSurface: '#0b1020',
      bgSubtle: '#121a33',
      textPrimary: '#c8d6e5',
      textSecondary: '#8395a7',
      textMuted: '#4b5563',
      accent: '#818cf8',
      accentHover: '#6366f1',
      accentSubtle: '#1e1b4b',
      error: '#f87171',
      errorSubtle: '#450a0a',
      caret: '#a5b4fc',
      border: '#1e293b'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      bgPrimary: '#0b1311',
      bgSurface: '#121e1a',
      bgSubtle: '#1a2a25',
      textPrimary: '#d1fae5',
      textSecondary: '#6ee7b7',
      textMuted: '#065f46',
      accent: '#10b981',
      accentHover: '#059669',
      accentSubtle: '#064e3b',
      error: '#f87171',
      errorSubtle: '#450a0a',
      caret: '#34d399',
      border: '#1f3830'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      bgPrimary: '#0c0c0c',
      bgSurface: '#171717',
      bgSubtle: '#262626',
      textPrimary: '#ffffff',
      textSecondary: '#a3a3a3',
      textMuted: '#525252',
      accent: '#ffffff',
      accentHover: '#d4d4d4',
      accentSubtle: '#262626',
      error: '#e11d48',
      errorSubtle: '#4c0519',
      caret: '#ffffff',
      border: '#333333'
    }
  },
  {
    id: 'paper',
    name: 'Paper (Light)',
    colors: {
      bgPrimary: '#f5f4ef',
      bgSurface: '#eae7de',
      bgSubtle: '#ded9cb',
      textPrimary: '#1a1917',
      textSecondary: '#57534e',
      textMuted: '#a8a29e',
      accent: '#0284c7',
      accentHover: '#0369a1',
      accentSubtle: '#e0f2fe',
      error: '#dc2626',
      errorSubtle: '#fee2e2',
      caret: '#0284c7',
      border: '#d6d1c4'
    }
  }
];

export function applyTheme(theme: KeyArenaTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = theme.colors;

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
}
