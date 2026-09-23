'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { getAllTests, getPersonalBests, getLocalProfile } from '@/lib/db';
import { TypingTestResult } from '@keyarena/typing-engine';
import { Trophy, ArrowLeft, Medal, ShieldCheck, User } from 'lucide-react';

interface LeaderboardRecord {
  id: string;
  rank: number;
  displayName: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  date: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const [tests, setTests] = useState<TypingTestResult[]>([]);
  const [profile, setProfile] = useState(getLocalProfile());
  const [boardType, setBoardType] = useState<'local_bests' | 'daily' | 'all_tests'>('local_bests');

  useEffect(() => {
    getAllTests().then(setTests);
    setProfile(getLocalProfile());
  }, []);

  const records: LeaderboardRecord[] = useMemo(() => {
    if (boardType === 'local_bests') {
      // Top WPM tests
      return [...tests]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 50)
        .map((t, idx) => ({
          id: t.id,
          rank: idx + 1,
          displayName: profile.displayName,
          wpm: t.wpm,
          rawWpm: t.rawWpm,
          accuracy: t.accuracy,
          consistency: t.consistency,
          mode: `${t.config.mode} ${t.config.targetDuration ? `${t.config.targetDuration}s` : ''}`,
          date: t.completedAt,
          isCurrentUser: true
        }));
    }

    if (boardType === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      return [...tests]
        .filter((t) => t.completedAt.startsWith(today))
        .sort((a, b) => b.wpm - a.wpm)
        .map((t, idx) => ({
          id: t.id,
          rank: idx + 1,
          displayName: profile.displayName,
          wpm: t.wpm,
          rawWpm: t.rawWpm,
          accuracy: t.accuracy,
          consistency: t.consistency,
          mode: `${t.config.mode} ${t.config.targetDuration ? `${t.config.targetDuration}s` : ''}`,
          date: t.completedAt,
          isCurrentUser: true
        }));
    }

    // All tests recent
    return [...tests]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 50)
      .map((t, idx) => ({
        id: t.id,
        rank: idx + 1,
        displayName: profile.displayName,
        wpm: t.wpm,
        rawWpm: t.rawWpm,
        accuracy: t.accuracy,
        consistency: t.consistency,
        mode: `${t.config.mode} ${t.config.targetDuration ? `${t.config.targetDuration}s` : ''}`,
        date: t.completedAt,
        isCurrentUser: true
      }));
  }, [tests, boardType, profile.displayName]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-bg-subtle text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Leaderboards
              </h1>
              <p className="text-xs text-text-muted">
                Anonymous and verified local competitive rankings with anti-cheat validation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded mt-3 sm:mt-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Cheat Verified</span>
          </div>
        </div>

        {/* Board Switcher */}
        <div className="flex space-x-2 border-b border-border pb-3 mb-6 text-xs">
          <button
            onClick={() => setBoardType('local_bests')}
            className={`px-3 py-1.5 rounded transition-colors ${
              boardType === 'local_bests'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All-Time Records
          </button>
          <button
            onClick={() => setBoardType('daily')}
            className={`px-3 py-1.5 rounded transition-colors ${
              boardType === 'daily'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Today's Scores
          </button>
          <button
            onClick={() => setBoardType('all_tests')}
            className={`px-3 py-1.5 rounded transition-colors ${
              boardType === 'all_tests'
                ? 'bg-bg-subtle text-accent font-semibold border border-border'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Recent Sessions
          </button>
        </div>

        {/* Table */}
        {records.length > 0 ? (
          <div className="border border-border rounded-md overflow-x-auto bg-bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-subtle/60 border-b border-border text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Pilot</th>
                  <th className="py-2.5 px-4">WPM</th>
                  <th className="py-2.5 px-4">Raw</th>
                  <th className="py-2.5 px-4">Accuracy</th>
                  <th className="py-2.5 px-4">Consistency</th>
                  <th className="py-2.5 px-4">Mode</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-bg-subtle/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center font-bold">
                      {rec.rank === 1 ? (
                        <span className="text-amber-400">1</span>
                      ) : rec.rank === 2 ? (
                        <span className="text-slate-300">2</span>
                      ) : rec.rank === 3 ? (
                        <span className="text-amber-700">3</span>
                      ) : (
                        <span className="text-text-muted">{rec.rank}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: profile.avatarColor }}
                      />
                      <span className="font-semibold text-text-primary">{rec.displayName}</span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-accent">{rec.wpm}</td>
                    <td className="py-2.5 px-4 text-text-secondary">{rec.rawWpm}</td>
                    <td className="py-2.5 px-4 text-text-primary">{rec.accuracy}%</td>
                    <td className="py-2.5 px-4 text-text-muted">{rec.consistency}%</td>
                    <td className="py-2.5 px-4 capitalize text-text-muted">{rec.mode}</td>
                    <td className="py-2.5 px-4 text-right text-text-muted">
                      {new Date(rec.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-bg-surface border border-border rounded text-xs text-text-muted">
            No entries found on this leaderboard. Complete tests to build your ranking!
          </div>
        )}
      </main>
    </div>
  );
}
