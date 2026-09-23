'use client';

import React, { useState } from 'react';
import { PRESET_THEMES, KeyArenaTheme, applyTheme } from '@/lib/themes';
import { getSettings, saveSettings } from '@/lib/settings';
import { Palette, Check, Plus, X, RotateCcw } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged?: (themeId: string) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged
}) => {
  const currentSettings = getSettings();
  const [activeThemeId, setActiveThemeId] = useState(currentSettings.theme);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Custom theme editor state
  const [customColors, setCustomColors] = useState({
    bgPrimary: '#0d0f12',
    bgSurface: '#14181f',
    bgSubtle: '#1b202a',
    textPrimary: '#e6edf3',
    textSecondary: '#9ca7b8',
    textMuted: '#4f596a',
    accent: '#38bdf8',
    accentHover: '#0ea5e9',
    accentSubtle: '#0c2d48',
    error: '#ef4444',
    errorSubtle: '#451212',
    caret: '#38bdf8',
    border: '#232936'
  });

  if (!isOpen) return null;

  const selectPreset = (theme: KeyArenaTheme) => {
    setActiveThemeId(theme.id);
    applyTheme(theme);
    saveSettings({ theme: theme.id });
    onThemeChanged?.(theme.id);
  };

  const applyCustomTheme = () => {
    const customTheme: KeyArenaTheme = {
      id: 'custom_user',
      name: 'Custom',
      isCustom: true,
      colors: customColors
    };
    setActiveThemeId('custom_user');
    applyTheme(customTheme);
    saveSettings({ theme: 'custom_user' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('keyarena_custom_theme', JSON.stringify(customTheme));
    }
    onThemeChanged?.('custom_user');
    setIsCustomMode(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-bg-surface border border-border rounded-lg shadow-2xl p-6 font-mono select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Theme Selector
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCustomMode ? (
          <div>
            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {PRESET_THEMES.map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => selectPreset(theme)}
                    className={`p-3 rounded-md border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-accent ring-1 ring-accent bg-bg-subtle'
                        : 'border-border bg-bg-subtle/40 hover:border-text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-text-primary">
                        {theme.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center space-x-1">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colors.bgPrimary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colors.textPrimary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colors.error }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => setIsCustomMode(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg-subtle border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Custom Theme Studio</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-accent text-bg-primary text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Custom Theme Studio */}
            <div className="text-xs text-text-muted mb-4">
              Fine-tune custom CSS tokens for your dark-first workspace:
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 mb-6 text-xs">
              {[
                { key: 'bgPrimary', label: 'Background Primary' },
                { key: 'bgSurface', label: 'Surface Panel' },
                { key: 'textPrimary', label: 'Text Primary' },
                { key: 'textMuted', label: 'Text Muted' },
                { key: 'accent', label: 'Accent Key' },
                { key: 'caret', label: 'Caret Color' },
                { key: 'error', label: 'Error Highlight' },
                { key: 'border', label: 'Border Color' }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded bg-bg-subtle border border-border"
                >
                  <span className="text-text-secondary">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColors[item.key as keyof typeof customColors]}
                      onChange={(e) =>
                        setCustomColors({ ...customColors, [item.key]: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] text-text-muted">
                      {customColors[item.key as keyof typeof customColors]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={() => setIsCustomMode(false)}
                className="px-3 py-1.5 rounded text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Back to Presets
              </button>

              <button
                onClick={applyCustomTheme}
                className="px-4 py-1.5 rounded bg-accent text-bg-primary text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                Save & Apply Theme
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
