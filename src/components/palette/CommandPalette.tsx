'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  RotateCcw,
  Clock,
  Type,
  Quote,
  Globe,
  BarChart2,
  Settings,
  Target,
  Trophy,
  Search,
  X
} from 'lucide-react';
import { ALL_LANGUAGES } from '@/lib/languages';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTest?: () => void;
  onChangeMode?: (mode: 'time' | 'words' | 'quote' | 'custom') => void;
  onChangeDuration?: (sec: number) => void;
  onChangeLanguage?: (lang: string) => void;
  onTogglePunctuation?: () => void;
  onToggleNumbers?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRestartTest,
  onChangeMode,
  onChangeDuration,
  onChangeLanguage,
  onTogglePunctuation,
  onToggleNumbers
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseCommands: CommandItem[] = [
    {
      id: 'restart',
      title: 'Restart Typing Test',
      category: 'Test',
      icon: RotateCcw,
      shortcut: 'Tab',
      action: () => {
        onRestartTest?.();
        onClose();
      }
    },
    {
      id: 'mode_time_15',
      title: 'Switch to Time 15s',
      category: 'Mode',
      icon: Clock,
      action: () => {
        onChangeMode?.('time');
        onChangeDuration?.(15);
        onClose();
      }
    },
    {
      id: 'mode_time_30',
      title: 'Switch to Time 30s',
      category: 'Mode',
      icon: Clock,
      action: () => {
        onChangeMode?.('time');
        onChangeDuration?.(30);
        onClose();
      }
    },
    {
      id: 'mode_time_60',
      title: 'Switch to Time 60s',
      category: 'Mode',
      icon: Clock,
      action: () => {
        onChangeMode?.('time');
        onChangeDuration?.(60);
        onClose();
      }
    },
    {
      id: 'mode_words_25',
      title: 'Switch to Words 25',
      category: 'Mode',
      icon: Type,
      action: () => {
        onChangeMode?.('words');
        onClose();
      }
    },
    {
      id: 'mode_quote',
      title: 'Switch to Quotes Mode',
      category: 'Mode',
      icon: Quote,
      action: () => {
        onChangeMode?.('quote');
        onClose();
      }
    },
    {
      id: 'toggle_punctuation',
      title: 'Toggle Punctuation',
      category: 'Modifiers',
      icon: Type,
      action: () => {
        onTogglePunctuation?.();
        onClose();
      }
    },
    {
      id: 'toggle_numbers',
      title: 'Toggle Numbers',
      category: 'Modifiers',
      icon: Type,
      action: () => {
        onToggleNumbers?.();
        onClose();
      }
    },
    {
      id: 'nav_practice',
      title: 'Open Deliberate Practice',
      category: 'Navigation',
      icon: Target,
      action: () => {
        router.push('/practice');
        onClose();
      }
    },
    {
      id: 'nav_stats',
      title: 'Open Performance Statistics',
      category: 'Navigation',
      icon: BarChart2,
      action: () => {
        router.push('/stats');
        onClose();
      }
    },
    {
      id: 'nav_leaderboard',
      title: 'Open Leaderboard',
      category: 'Navigation',
      icon: Trophy,
      action: () => {
        router.push('/leaderboard');
        onClose();
      }
    },
    {
      id: 'nav_settings',
      title: 'Open Settings & Theme Studio',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        router.push('/settings');
        onClose();
      }
    }
  ];

  // Language commands
  const languageCommands: CommandItem[] = ALL_LANGUAGES.map((l) => ({
    id: `lang_${l.id}`,
    title: `Language: ${l.name}`,
    category: 'Languages',
    icon: Globe,
    action: () => {
      onChangeLanguage?.(l.id);
      onClose();
    }
  }));

  const allCommands = [...baseCommands, ...languageCommands];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleGlobalKey);
      return () => window.removeEventListener('keydown', handleGlobalKey);
    }
  }, [isOpen, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-bg-surface border border-border rounded-lg shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-bg-surface">
          <Search className="w-4 h-4 text-text-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="text-[10px] bg-bg-subtle text-text-muted px-1.5 py-0.5 rounded border border-border">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent text-bg-primary font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-bg-primary' : 'text-text-muted'}`} />
                    <span>{cmd.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] tracking-wider uppercase ${
                        isSelected ? 'text-bg-primary/70' : 'text-text-muted'
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'border-bg-primary/40 bg-bg-primary/20'
                            : 'border-border bg-bg-subtle text-text-muted'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
