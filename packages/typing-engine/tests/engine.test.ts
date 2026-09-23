import { describe, it, expect } from 'vitest';
import { TypingEngine } from '../src/engine';

describe('TypingEngine State Machine and Behavior', () => {
  it('initializes in idle state and transitions to running on first keypress', () => {
    const engine = new TypingEngine('hello world', { mode: 'words', targetWordCount: 2 });
    expect(engine.status).toBe('idle');
    expect(engine.words.length).toBe(2);

    engine.handleKey('h', 1000);
    expect(engine.status).toBe('running');
    expect(engine.startTime).toBe(1000);
    expect(engine.words[0].chars[0].status).toBe('correct');
  });

  it('marks correct and incorrect characters accurately', () => {
    const engine = new TypingEngine('hello world', { mode: 'words', targetWordCount: 2 });

    engine.handleKey('h', 1000);
    expect(engine.words[0].chars[0].status).toBe('correct');

    engine.handleKey('x', 1100); // Expected 'e', got 'x'
    expect(engine.words[0].chars[1].status).toBe('incorrect');
    expect(engine.incorrectKeystrokes).toBe(1);
    expect(engine.words[0].hasErrors).toBe(true);
  });

  it('handles backspace correction properly', () => {
    const engine = new TypingEngine('test app', { mode: 'words', targetWordCount: 2 });

    engine.handleKey('t', 1000);
    engine.handleKey('x', 1100); // Typo
    expect(engine.currentCharIndex).toBe(2);
    expect(engine.words[0].chars[1].status).toBe('incorrect');

    engine.handleKey('Backspace', 1200);
    expect(engine.currentCharIndex).toBe(1);
    expect(engine.words[0].chars[1].status).toBe('idle');
    expect(engine.correctedErrors).toBe(1);

    // Re-type correct char
    engine.handleKey('e', 1300);
    expect(engine.words[0].chars[1].status).toBe('correct');
  });

  it('progresses to next word upon Space key and completes when done', () => {
    const engine = new TypingEngine('cat dog', { mode: 'words', targetWordCount: 2 });

    // Type 'cat'
    engine.handleKey('c', 1000);
    engine.handleKey('a', 1100);
    engine.handleKey('t', 1200);
    expect(engine.currentWordIndex).toBe(0);

    // Space to advance
    engine.handleKey(' ', 1300);
    expect(engine.currentWordIndex).toBe(1);
    expect(engine.currentCharIndex).toBe(0);
    expect(engine.words[0].isCompleted).toBe(true);

    // Type 'dog'
    engine.handleKey('d', 1400);
    engine.handleKey('o', 1500);
    engine.handleKey('g', 1600);

    expect(engine.status).toBe('completed');
    expect(engine.correctKeystrokes).toBe(6);
    expect(engine.incorrectKeystrokes).toBe(0);
  });

  it('triggers sudden death immediately upon error if modifier is set', () => {
    const engine = new TypingEngine('quick run', {
      mode: 'words',
      targetWordCount: 2,
      modifiers: ['sudden-death']
    });

    engine.handleKey('q', 1000);
    expect(engine.status).toBe('running');

    engine.handleKey('z', 1100); // Error
    expect(engine.status).toBe('failed');
  });

  it('ignores backspace when no-backspace modifier is enabled', () => {
    const engine = new TypingEngine('focus', {
      mode: 'words',
      targetWordCount: 1,
      modifiers: ['no-backspace']
    });

    engine.handleKey('f', 1000);
    engine.handleKey('z', 1100);
    expect(engine.currentCharIndex).toBe(2);

    engine.handleKey('Backspace', 1200);
    expect(engine.currentCharIndex).toBe(2); // Still at 2, backspace ignored
  });

  it('completes time-based tests when duration is reached via tick', () => {
    const engine = new TypingEngine('the quick brown fox', {
      mode: 'time',
      targetDuration: 15
    });

    engine.handleKey('t', 1000);
    expect(engine.status).toBe('running');

    // Simulate clock ticks
    engine.tick(5000);
    expect(engine.status).toBe('running');

    engine.tick(16000); // 15s elapsed
    expect(engine.status).toBe('completed');
  });
});
