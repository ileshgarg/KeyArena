import { describe, it, expect } from 'vitest';
import { calculateWpm, calculateRawWpm, calculateAccuracy, calculateConsistency } from '../src/metrics';

describe('Typing Engine Metrics Calculations', () => {
  it('calculates standard WPM accurately', () => {
    // 50 correct characters in 15 seconds (0.25 min) = (50 / 5) / 0.25 = 40 WPM
    expect(calculateWpm(50, 15000)).toBe(40);

    // 100 correct characters in 30 seconds (0.5 min) = (100 / 5) / 0.5 = 40 WPM
    expect(calculateWpm(100, 30000)).toBe(40);

    // 300 correct characters in 60 seconds (1.0 min) = (300 / 5) / 1.0 = 60 WPM
    expect(calculateWpm(300, 60000)).toBe(60);

    // 0 characters or 0 ms returns 0
    expect(calculateWpm(0, 30000)).toBe(0);
    expect(calculateWpm(100, 0)).toBe(0);
  });

  it('calculates Raw WPM accurately with total keystrokes', () => {
    // 60 total keystrokes in 15s = (60 / 5) / 0.25 = 48 Raw WPM
    expect(calculateRawWpm(60, 15000)).toBe(48);
  });

  it('calculates Accuracy percentage accurately', () => {
    // 95 correct out of 100 total keystrokes = 95.0%
    expect(calculateAccuracy(95, 100)).toBe(95);

    // 48 correct out of 50 total = 96.0%
    expect(calculateAccuracy(48, 50)).toBe(96);

    // Zero keystrokes returns 100%
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('calculates Consistency reliably', () => {
    // Telemetry with uniform speed should yield near 100% consistency
    const uniform = [
      { second: 1, wpm: 60, rawWpm: 60, errors: 0, accuracy: 100 },
      { second: 2, wpm: 60, rawWpm: 60, errors: 0, accuracy: 100 },
      { second: 3, wpm: 60, rawWpm: 60, errors: 0, accuracy: 100 },
      { second: 4, wpm: 60, rawWpm: 60, errors: 0, accuracy: 100 }
    ];
    expect(calculateConsistency(uniform)).toBe(100);

    // Wildly fluctuating speed should lower consistency
    const variable = [
      { second: 1, wpm: 20, rawWpm: 20, errors: 0, accuracy: 100 },
      { second: 2, wpm: 100, rawWpm: 100, errors: 0, accuracy: 100 },
      { second: 3, wpm: 30, rawWpm: 30, errors: 0, accuracy: 100 },
      { second: 4, wpm: 120, rawWpm: 120, errors: 0, accuracy: 100 }
    ];
    const score = calculateConsistency(variable);
    expect(score).toBeLessThan(60);
  });
});
