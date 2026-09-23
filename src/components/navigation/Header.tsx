'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Keyboard,
  Flame,
  BarChart2,
  Trophy,
  Target,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Command
} from 'lucide-react';
import { getStreak, LocalStreak, getLocalProfile, LocalProfile } from '@/lib/db';
import { getSettings, saveSettings } from '@/lib/settings';
import { soundEngine } from '@/lib/audio/sound-engine';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
  onOpenThemeModal?: () => void;
  isTypingFocus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenThemeModal,
  isTypingFocus = false
}) => {
  const pathname = usePathname();
  const [streak, setStreak] = useState<LocalStreak | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setStreak(getStreak());
    setProfile(getLocalProfile());
    const s = getSettings();
    setSoundEnabled(s.sounds.enabled);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    saveSettings({ sounds: { ...getSettings().sounds, enabled: next } });
    soundEngine.updateConfig({ enabled: next });
    if (next) soundEngine.playKey();
  };

  const navItems = [
    { href: '/', label: 'Test', icon: Keyboard },
    { href: '/practice', label: 'Practice', icon: Target },
    { href: '/stats', label: 'Statistics', icon: BarChart2 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/challenge', label: 'Challenges', icon: Flame },
    { href: '/multiplayer', label: 'Multiplayer', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header
      className={`w-full border-b border-border bg-bg-surface/90 backdrop-blur-sm transition-opacity duration-300 ${
        isTypingFocus ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand wordmark */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center group py-1" title="KeyArena Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="KeyArena Logo"
              className="h-10 sm:h-11 w-auto hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-bg-subtle text-accent border border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side utility bar */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Practice Streak */}
          {streak && streak.currentStreak > 0 && (
            <div
              className="flex items-center space-x-1 px-2 py-1 rounded bg-bg-subtle border border-border text-xs font-mono text-amber-500"
              title={`${streak.currentStreak} day practice streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak.currentStreak}d</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            title={soundEnabled ? 'Typing Sound: On' : 'Typing Sound: Off'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-accent" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Theme Switcher Quick Trigger */}
          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              aria-label="Theme Palette"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
              title="Change Theme"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded bg-bg-subtle border border-border text-xs font-mono text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
            title="Open Command Palette (Esc)"
          >
            <Command className="w-3 h-3 text-accent" />
            <span className="text-[11px]">Esc</span>
          </button>

          {/* Local Profile Badge (No Auth) */}
          {profile && (
            <Link
              href="/settings#profile"
              className="flex items-center space-x-1.5 pl-2 border-l border-border text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
              title="Local Profile"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: profile.avatarColor }}
              />
              <span className="max-w-[100px] truncate">{profile.displayName}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
