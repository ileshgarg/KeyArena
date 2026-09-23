import { SecondTelemetry } from './types';

/**
 * Standard WPM: (correct characters / 5) / (elapsed time in minutes)
 */
export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const wpm = correctChars / 5 / minutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Raw WPM: (all characters typed including errors / 5) / (elapsed time in minutes)
 */
export function calculateRawWpm(totalKeystrokes: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || totalKeystrokes <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const rawWpm = totalKeystrokes / 5 / minutes;
  return Math.max(0, Math.round(rawWpm * 10) / 10);
}

/**
 * Accuracy percentage: (correct characters / total typed characters) * 100
 */
export function calculateAccuracy(correctChars: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  const acc = (correctChars / totalKeystrokes) * 100;
  return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
}

/**
 * Consistency percentage:
 * Based on the coefficient of variation (CV) of keystroke intervals or per-second telemetry.
 * If telemetry points are provided, we compute the variance of rolling raw WPM.
 */
export function calculateConsistency(telemetry: SecondTelemetry[]): number {
  if (!telemetry || telemetry.length < 2) return 100;

  const rawValues = telemetry.map((t) => t.rawWpm).filter((v) => v > 0);
  if (rawValues.length < 2) return 100;

  const mean = rawValues.reduce((sum, v) => sum + v, 0) / rawValues.length;
  if (mean === 0) return 100;

  const variance =
    rawValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / rawValues.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Consistency = max(0, min(100, 100 * (1 - cv)))
  const consistency = Math.max(0, Math.min(100, (1 - cv) * 100));
  return Math.round(consistency * 10) / 10;
}

/**
 * Consistency from raw keystroke intervals (milliseconds between key presses)
 */
export function calculateIntervalConsistency(intervalsMs: number[]): number {
  if (!intervalsMs || intervalsMs.length < 5) return 100;

  // Filter out any initial latency pause (> 2000ms)
  const validIntervals = intervalsMs.filter((t) => t > 0 && t < 2000);
  if (validIntervals.length < 5) return 100;

  const mean = validIntervals.reduce((sum, v) => sum + v, 0) / validIntervals.length;
  if (mean === 0) return 100;

  const variance =
    validIntervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validIntervals.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Consistency based on key interval regularity
  const consistency = Math.max(0, Math.min(100, (1 - cv * 0.75) * 100));
  return Math.round(consistency * 10) / 10;
}
