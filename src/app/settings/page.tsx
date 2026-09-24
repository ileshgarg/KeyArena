'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import {
  getSettings,
  saveSettings,
  KeyArenaSettings,
  CaretStyle,
  CaretAnimation,
  FocusModeLevel
} from '@/lib/settings';
import {
  getLocalProfile,
  saveLocalProfile,
  LocalProfile,
  exportAllData,
  importData,
  clearAllTests
} from '@/lib/db';
import { soundEngine, SoundType } from '@/lib/audio/sound-engine';
import {
  Settings,
  Volume2,
  Keyboard,
  Shield,
  Download,
  Upload,
  Trash2,
  ArrowLeft,
  Check,
  RotateCcw,
  Sliders,
  User
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<KeyArenaSettings>(getSettings());
  const [profile, setProfile] = useState<LocalProfile>(getLocalProfile());
  const [activeSection, setActiveSection] = useState<string>('typing');
  const [savedNotice, setSavedNotice] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    setProfile(getLocalProfile());
  }, []);

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const updateSetting = <K extends keyof KeyArenaSettings>(key: K, value: KeyArenaSettings[K]) => {
    const updated = saveSettings({ [key]: value });
    setSettings(updated);
    triggerSaveNotice();
  };

  const updateSoundSetting = (key: string, value: any) => {
    const nextSound = { ...settings.sounds, [key]: value };
    const updated = saveSettings({ sounds: nextSound });
    soundEngine.updateConfig(nextSound);
    setSettings(updated);
    if (nextSound.enabled && (key === 'type' || key === 'keyVolume')) {
      soundEngine.playKey();
    }
    triggerSaveNotice();
  };

  const handleProfileUpdate = (name: string, color: string) => {
    const updated = saveLocalProfile({ displayName: name, avatarColor: color });
    setProfile(updated);
    triggerSaveNotice();
  };

  const handleExport = async () => {
    const jsonStr = await exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyarena_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const success = await importData(text);
      if (success) {
        setImportStatus('Data imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Import failed. Invalid KeyArena JSON format.');
      }
    } catch {
      setImportStatus('Error reading backup file.');
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('WARNING: This will reset all your typing tests, statistics, and personal records. Are you completely sure?')) {
      await clearAllTests();
      localStorage.clear();
      window.location.reload();
    }
  };

  const sections = [
    { id: 'profile', label: 'Local Profile', icon: User },
    { id: 'typing', label: 'Typing & Caret', icon: Keyboard },
    { id: 'sound', label: 'Sound & Audio', icon: Volume2 },
    { id: 'data', label: 'Data Management & Privacy', icon: Shield }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Settings
              </h1>
              <p className="text-xs text-text-muted">
                Application preferences, typography, procedural audio, and local data persistence
              </p>
            </div>
          </div>

          {savedNotice && (
            <div className="flex items-center space-x-1.5 text-xs text-accent bg-accent/10 border border-accent/30 px-2.5 py-1 rounded animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Section Navigation Tabs */}
          <div className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs text-left transition-colors ${
                    isActive
                      ? 'bg-bg-subtle text-accent font-semibold border border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <div className="md:col-span-3 bg-bg-surface border border-border rounded-lg p-6 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
                    Local Anonymous Profile
                  </h3>
                  <p className="text-xs text-text-muted">
                    Stored 100% inside your browser. No authentication, email, or passwords required.
                  </p>
                </div>

                <div className="space-y-3 max-w-sm text-xs">
                  <div>
                    <label className="block text-text-muted mb-1">Display Call-sign / Nickname</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => handleProfileUpdate(e.target.value, profile.avatarColor)}
                      className="w-full bg-bg-subtle border border-border rounded p-2 text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1">Pilot Beacon Color</label>
                    <div className="flex items-center space-x-2">
                      {['#FFFFFF', '#94a3b8', '#10b981', '#f59e0b', '#ec4899', '#ef4444'].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleProfileUpdate(profile.displayName, c)}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            profile.avatarColor === c ? 'scale-110 border-white ring-1 ring-white' : 'border-border'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing & Caret Section */}
            {activeSection === 'typing' && (
              <div className="space-y-6 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
                    Typing & Caret Configuration
                  </h3>
                  <p className="text-xs text-text-muted">
                    Fine-tune cursor physics and visual disturbance thresholds.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <span className="font-semibold text-text-primary block">Caret Style</span>
                      <span className="text-text-muted text-[11px]">Visual representation of current cursor</span>
                    </div>
                    <div className="flex space-x-1">
                      {(['line', 'block', 'underline'] as CaretStyle[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateSetting('caretStyle', s)}
                          className={`px-2.5 py-1 rounded capitalize border ${
                            settings.caretStyle === s
                              ? 'border-accent text-accent font-bold bg-bg-subtle'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <span className="font-semibold text-text-primary block">Caret Animation</span>
                      <span className="text-text-muted text-[11px]">Dynamic movement physics</span>
                    </div>
                    <div className="flex space-x-1">
                      {(['smooth', 'blink', 'static'] as CaretAnimation[]).map((a) => (
                        <button
                          key={a}
                          onClick={() => updateSetting('caretAnimation', a)}
                          className={`px-2.5 py-1 rounded capitalize border ${
                            settings.caretAnimation === a
                              ? 'border-accent text-accent font-bold bg-bg-subtle'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <span className="font-semibold text-text-primary block">Focus Mode</span>
                      <span className="text-text-muted text-[11px]">Dim non-essential interface while typing</span>
                    </div>
                    <div className="flex space-x-1">
                      {(['off', 'subtle', 'full'] as FocusModeLevel[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => updateSetting('focusMode', f)}
                          className={`px-2.5 py-1 rounded capitalize border ${
                            settings.focusMode === f
                              ? 'border-accent text-accent font-bold bg-bg-subtle'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-text-primary block">Keyboard Layout</span>
                      <span className="text-text-muted text-[11px]">Key positions for visualization & heatmap</span>
                    </div>
                    <select
                      value={settings.keyboardLayout}
                      onChange={(e) => updateSetting('keyboardLayout', e.target.value as any)}
                      className="bg-bg-subtle border border-border rounded px-2.5 py-1 text-text-primary uppercase"
                    >
                      <option value="qwerty">QWERTY</option>
                      <option value="qwertz">QWERTZ</option>
                      <option value="azerty">AZERTY</option>
                      <option value="dvorak">Dvorak</option>
                      <option value="colemak">Colemak</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Sound & Audio Section */}
            {activeSection === 'sound' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
                    Web Audio Procedural Sound
                  </h3>
                  <p className="text-xs text-text-muted">
                    Zero latency, synthesized waveforms. 100% offline with zero audio file lag.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-semibold text-text-primary">Enable Typing Audio</span>
                    <button
                      onClick={() => updateSoundSetting('enabled', !settings.sounds.enabled)}
                      className={`px-3 py-1 rounded border ${
                        settings.sounds.enabled
                          ? 'border-accent text-accent font-bold bg-bg-subtle'
                          : 'border-border text-text-muted'
                      }`}
                    >
                      {settings.sounds.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-semibold text-text-primary">Switch Sound Type</span>
                    <div className="flex flex-wrap gap-1">
                      {(['mechanical', 'typewriter', 'soft', 'click', 'muted'] as SoundType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSoundSetting('type', t)}
                          className={`px-2.5 py-1 rounded capitalize border ${
                            settings.sounds.type === t
                              ? 'border-accent text-accent font-bold bg-bg-subtle'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Master Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.sounds.masterVolume}
                        onChange={(e) => updateSoundSetting('masterVolume', parseFloat(e.target.value))}
                        className="w-40 accent-accent"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Key Click Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.sounds.keyVolume}
                        onChange={(e) => updateSoundSetting('keyVolume', parseFloat(e.target.value))}
                        className="w-40 accent-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Privacy Section */}
            {activeSection === 'data' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
                    Data Management & Privacy
                  </h3>
                  <p className="text-xs text-text-muted">
                    KeyArena requires no account. All tests, statistics, and records reside exclusively inside your browser&apos;s IndexedDB.
                  </p>
                </div>

                <div className="p-4 bg-bg-subtle border border-border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-text-primary block">Export Data</span>
                      <span className="text-text-muted text-[11px]">Download full JSON backup of tests, records, and preferences</span>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg-surface border border-border hover:border-accent text-text-primary transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div>
                      <span className="font-semibold text-text-primary block">Import Data</span>
                      <span className="text-text-muted text-[11px]">Restore your records from a previous JSON backup</span>
                    </div>
                    <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg-surface border border-border hover:border-accent text-text-primary cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {importStatus && (
                    <div className="text-[11px] text-accent pt-2">{importStatus}</div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-error block">Reset All Data</span>
                      <span className="text-text-muted text-[11px]">Permanently erase local history and settings</span>
                    </div>
                    <button
                      onClick={handleResetAll}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset Everything</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
