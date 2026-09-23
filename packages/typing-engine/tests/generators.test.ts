import { describe, it, expect } from 'vitest';
import { generatePrompt, SeededRandom } from '../src/generators';
import { validateTypingRun } from '../src/anticheat';

describe('Prompt Generators and Modifiers', () => {
  it('generates deterministic output with the same seed', () => {
    const prompt1 = generatePrompt({ mode: 'words', targetWordCount: 10, seed: 'daily-2026-09-22' });
    const prompt2 = generatePrompt({ mode: 'words', targetWordCount: 10, seed: 'daily-2026-09-22' });
    const prompt3 = generatePrompt({ mode: 'words', targetWordCount: 10, seed: 'daily-2026-09-23' });

    expect(prompt1).toBe(prompt2);
    expect(prompt1).not.toBe(prompt3);
  });

  it('generates punctuation modifier realistic sentences', () => {
    const prompt = generatePrompt({
      mode: 'words',
      targetWordCount: 20,
      punctuation: true,
      seed: 42
    });

    // Punctuation should introduce periods, commas, or capitals
    expect(/[.,!?;]/.test(prompt)).toBe(true);
    expect(/[A-Z]/.test(prompt)).toBe(true);
  });

  it('generates numbers modifier realistically', () => {
    const prompt = generatePrompt({
      mode: 'words',
      targetWordCount: 20,
      numbers: true,
      seed: 99
    });

    expect(/[0-9]/.test(prompt)).toBe(true);
  });

  it('validates anti-cheat physical limits and flags impossible speeds', () => {
    const validRun = validateTypingRun(
      [
        { key: 'a', timeMs: 0 },
        { key: 'b', timeMs: 120 },
        { key: 'c', timeMs: 250 },
        { key: 'd', timeMs: 390 },
        { key: 'e', timeMs: 510 },
        { key: 'f', timeMs: 650 },
        { key: 'g', timeMs: 800 },
        { key: 'h', timeMs: 940 },
        { key: 'i', timeMs: 1070 },
        { key: 'j', timeMs: 1210 }
      ],
      95,
      15000,
      100
    );

    expect(validRun.isValid).toBe(true);

    const impossibleRun = validateTypingRun([], 400, 5000, 300);
    expect(impossibleRun.isValid).toBe(false);
    expect(impossibleRun.flags.length).toBeGreaterThan(0);
  });
});
