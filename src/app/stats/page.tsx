'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { getAllTests, deleteTest, clearAllTests, getPersonalBests } from '@/lib/db';
import { TypingTestResult } from '@keyarena/typing-engine';
import {
  BarChart2,
  Trophy,
  Trash2,
  Calendar,
  Clock,
  Zap,
  Target,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

type TimeRange = 'today' | '7d' | '30d' | '90d' | 'all';

export default function StatisticsPage() {
  const [tests, setTests] = useState<TypingTestResult[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<string, { wpm: number; accuracy: number; achievedAt: string }>>({});
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'wpm' | 'acc'>('date');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const all = await getAllTests();
    const pbs = await getPersonalBests();
    setTests(all);
    setPersonalBests(pbs);
  };

  const handleDelete = async (id: string) => {
    await deleteTest(id);
    await loadData();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all test history? This action cannot be undone.')) {
      await clearAllTests();
      await loadData();
    }
  };

  // Filtered by time range and mode
  const filteredTests = useMemo(() => {
    const now = Date.now();
    return tests.filter((t) => {
      const testTime = new Date(t.completedAt).getTime();
      const diffMs = now - testTime;

      if (timeRange === 'today' && diffMs > 86400000) return false;
      if (timeRange === '7d' && diffMs > 7 * 86400000) return false;
      if (timeRange === '30d' && diffMs > 30 * 86400000) return false;
      if (timeRange === '90d' && diffMs > 90 * 86400000) return false;

      if (modeFilter !== 'all' && t.config.mode !== modeFilter) return false;

      return true;
    });
  }, [tests, timeRange, modeFilter]);

  // Aggregated Statistics
  const stats = useMemo(() => {
    if (filteredTests.length === 0) {
      return {
        avgWpm: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        bestAccuracy: 0,
        totalTests: 0,
        totalDurationSec: 0,
        totalWords: 0,
        totalChars: 0,
        avgConsistency: 0
      };
    }

    const totalTests = filteredTests.length;
    const bestWpm = Math.max(...filteredTests.map((t) => t.wpm));
    const avgWpm = Math.round((filteredTests.reduce((acc, t) => acc + t.wpm, 0) / totalTests) * 10) / 10;

    const bestAccuracy = Math.max(...filteredTests.map((t) => t.accuracy));
    const avgAccuracy = Math.round((filteredTests.reduce((acc, t) => acc + t.accuracy, 0) / totalTests) * 10) / 10;

    const totalDurationSec = Math.round(filteredTests.reduce((acc, t) => acc + t.elapsedMs, 0) / 1000);
    const totalWords = filteredTests.reduce((acc, t) => acc + t.wordsTyped, 0);
    const totalChars = filteredTests.reduce((acc, t) => acc + t.totalKeystrokes, 0);

    const avgConsistency =
      Math.round((filteredTests.reduce((acc, t) => acc + t.consistency, 0) / totalTests) * 10) / 10;

    return {
      avgWpm,
      bestWpm,
      avgAccuracy,
      bestAccuracy,
      totalTests,
      totalDurationSec,
      totalWords,
      totalChars,
      avgConsistency
    };
  }, [filteredTests]);

  // Sorted tests
  const sortedTests = useMemo(() => {
    const list = [...filteredTests];
    if (sortBy === 'wpm') {
      list.sort((a, b) => b.wpm - a.wpm);
    } else if (sortBy === 'acc') {
      list.sort((a, b) => b.accuracy - a.accuracy);
    } else {
      list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
    return list;
  }, [filteredTests, sortBy]);

  // Progression Data for Chart (last 30 tests chronological)
  const progressionData = useMemo(() => {
    return [...filteredTests].reverse().slice(-30);
  }, [filteredTests]);

  const chartWidth = 720;
  const chartHeight = 160;
  const chartPad = 24;
  const maxChartWpm = Math.max(60, ...progressionData.map((d) => d.wpm)) + 10;

  const progressionPoints = progressionData
    .map((d, i) => {
      const x = chartPad + (i / Math.max(1, progressionData.length - 1)) * (chartWidth - chartPad * 2);
      const y = chartHeight - chartPad - (d.wpm / maxChartWpm) * (chartHeight - chartPad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-mono select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title Bar & Filter Controls */}
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
                Performance Analytics
              </h1>
              <p className="text-xs text-text-muted">
                Locally persistent telemetry and long-term typing progress
              </p>
            </div>
          </div>

          {/* Time range pills */}
          <div className="flex items-center space-x-1 bg-bg-surface border border-border p-1 rounded text-xs mt-3 sm:mt-0">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  timeRange === r
                    ? 'bg-bg-subtle text-accent font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              average wpm
            </span>
            <span className="text-2xl font-bold text-accent">{stats.avgWpm}</span>
          </div>

          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              best wpm
            </span>
            <span className="text-2xl font-bold text-text-primary">{stats.bestWpm}</span>
          </div>

          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              avg accuracy
            </span>
            <span className="text-2xl font-bold text-text-primary">
              {stats.avgAccuracy}%
            </span>
          </div>

          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              avg consistency
            </span>
            <span className="text-2xl font-bold text-text-primary">
              {stats.avgConsistency}%
            </span>
          </div>

          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              tests completed
            </span>
            <span className="text-2xl font-bold text-text-primary">{stats.totalTests}</span>
          </div>

          <div className="p-4 bg-bg-surface border border-border rounded-md">
            <span className="text-[11px] text-text-muted block uppercase mb-1">
              total time
            </span>
            <span className="text-2xl font-bold text-text-primary">
              {Math.floor(stats.totalDurationSec / 60)}m {stats.totalDurationSec % 60}s
            </span>
          </div>
        </div>

        {/* Progression Curve Chart */}
        <div className="bg-bg-surface border border-border rounded-md p-5 mb-8">
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="font-semibold text-text-primary">
              WPM Progression (Recent Sessions)
            </span>
            <span className="text-text-muted">
              {progressionData.length} data points
            </span>
          </div>

          {progressionData.length >= 2 ? (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-40 overflow-visible text-[10px]"
              >
                {/* Horizontal guide lines */}
                {[0, 0.33, 0.66, 1].map((r, idx) => {
                  const y = chartPad + r * (chartHeight - chartPad * 2);
                  const val = Math.round(maxChartWpm * (1 - r));
                  return (
                    <g key={idx}>
                      <line
                        x1={chartPad}
                        y1={y}
                        x2={chartWidth - chartPad}
                        y2={y}
                        stroke="var(--border)"
                        strokeDasharray="2 2"
                      />
                      <text x={chartPad - 4} y={y + 3} fill="var(--text-muted)" textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Polyline */}
                <polyline
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  points={progressionPoints}
                />

                {/* Data points */}
                {progressionData.map((d, i) => {
                  const cx =
                    chartPad +
                    (i / Math.max(1, progressionData.length - 1)) * (chartWidth - chartPad * 2);
                  const cy =
                    chartHeight - chartPad - (d.wpm / maxChartWpm) * (chartHeight - chartPad * 2);
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="3"
                      fill="var(--accent)"
                      className="hover:r-5 transition-all"
                    >
                      <title>{`${d.wpm} WPM (${d.accuracy}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-text-muted">
              Complete at least 2 tests to visualize your WPM progression curve.
            </div>
          )}
        </div>

        {/* Personal Records Showcase */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Personal Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['time_15', 'time_30', 'time_60', 'time_120', 'words_10', 'words_25', 'words_50', 'words_100'].map((key) => {
              const pb = personalBests[key];
              const title = key.replace('_', ' ');
              return (
                <div
                  key={key}
                  className="p-3 bg-bg-surface/70 border border-border rounded flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <span className="capitalize">{title}</span>
                    <Trophy className="w-3.5 h-3.5 text-accent" />
                  </div>
                  {pb ? (
                    <div>
                      <div className="text-xl font-bold text-text-primary">
                        {pb.wpm} <span className="text-xs font-normal text-text-muted">WPM</span>
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {pb.accuracy}% accuracy
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-text-muted italic py-1">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Test History Table */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Test Log ({sortedTests.length})
            </h2>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 text-text-muted">
                <span>sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'wpm' | 'acc')}
                  className="bg-bg-surface border border-border rounded px-2 py-1 text-text-secondary cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="wpm">WPM</option>
                  <option value="acc">Accuracy</option>
                </select>
              </div>

              {tests.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-900/60 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {sortedTests.length > 0 ? (
            <div className="border border-border rounded-md overflow-x-auto bg-bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-subtle/60 border-b border-border text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">WPM</th>
                    <th className="py-2.5 px-3">Raw</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Consistency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sortedTests.map((test) => (
                    <tr key={test.id} className="hover:bg-bg-subtle/40 transition-colors">
                      <td className="py-2.5 px-3 text-text-secondary">
                        {new Date(test.completedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-text-muted">
                        {test.config.mode}{' '}
                        {test.config.mode === 'time'
                          ? `${test.config.targetDuration}s`
                          : test.config.mode === 'words'
                          ? `${test.config.targetWordCount}`
                          : ''}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-accent">{test.wpm}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{test.rawWpm}</td>
                      <td className="py-2.5 px-3 text-text-primary">{test.accuracy}%</td>
                      <td className="py-2.5 px-3 text-text-muted">{test.consistency}%</td>
                      <td className="py-2.5 px-3 text-text-muted">
                        {(test.elapsedMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-1 rounded text-text-muted hover:text-error hover:bg-bg-subtle transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-bg-surface border border-border rounded-md text-text-muted text-xs">
              No tests recorded for the selected filter. Complete a test on the home screen to see detailed analytics!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
