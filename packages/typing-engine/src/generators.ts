import { TestDifficulty } from './types';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export class SeededRandom {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
      }
      this.state = hash >>> 0;
    } else {
      this.state = seed >>> 0;
    }
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// Default core English word list (1K representative core)
export const CORE_ENGLISH_WORDS: string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not', 'on', 'she', 'at',
  'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more',
  'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take',
  'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find',
  'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just',
  'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life', 'tell', 'write',
  'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another',
  'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'child', 'small', 'since', 'against', 'late', 'hard', 'major', 'name', 'force',
  'order', 'system', 'early', 'case', 'water', 'group', 'line', 'course', 'face', 'court', 'side', 'power', 'public', 'read', 'head', 'keep', 'study', 'far', 'change', 'lead',
  'often', 'word', 'program', 'problem', 'however', 'lead', 'system', 'set', 'order', 'stand', 'govern', 'follow', 'around', 'stop', 'among', 'member', 'open', 'consider', 'hope', 'city',
  'plan', 'run', 'keep', 'hold', 'several', 'ground', 'letter', 'action', 'full', 'matter', 'cause', 'mind', 'reason', 'field', 'serve', 'market', 'force', 'pass', 'future', 'become',
  'always', 'listen', 'together', 'music', 'sound', 'reach', 'fast', 'slow', 'energy', 'space', 'clear', 'focus', 'measure', 'build', 'create', 'keyboard', 'motion', 'rhythm', 'pulse', 'arena'
];

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: string;
  difficulty: TestDifficulty;
  length: 'short' | 'medium' | 'long' | 'thicc';
  language: string;
}

export const CURATED_QUOTES: QuoteItem[] = [
  {
    id: 'q-1',
    text: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    category: 'technology',
    difficulty: 'easy',
    length: 'short',
    language: 'english'
  },
  {
    id: 'q-2',
    text: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
    category: 'technology',
    difficulty: 'easy',
    length: 'short',
    language: 'english'
  },
  {
    id: 'q-3',
    text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle.',
    author: 'Steve Jobs',
    category: 'philosophy',
    difficulty: 'normal',
    length: 'medium',
    language: 'english'
  },
  {
    id: 'q-4',
    text: 'Premature optimization is the root of all evil in software engineering.',
    author: 'Donald Knuth',
    category: 'technology',
    difficulty: 'normal',
    length: 'short',
    language: 'english'
  },
  {
    id: 'q-5',
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    category: 'technology',
    difficulty: 'normal',
    length: 'medium',
    language: 'english'
  },
  {
    id: 'q-6',
    text: 'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
    author: 'Antoine de Saint-Exupéry',
    category: 'literature',
    difficulty: 'normal',
    length: 'medium',
    language: 'english'
  },
  {
    id: 'q-7',
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    category: 'technology',
    difficulty: 'normal',
    length: 'medium',
    language: 'english'
  },
  {
    id: 'q-8',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    category: 'philosophy',
    difficulty: 'easy',
    length: 'short',
    language: 'english'
  },
  {
    id: 'q-9',
    text: 'In the middle of difficulty lies opportunity. Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.',
    author: 'Albert Einstein',
    category: 'philosophy',
    difficulty: 'hard',
    length: 'medium',
    language: 'english'
  },
  {
    id: 'q-10',
    text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    author: 'Ralph Waldo Emerson',
    category: 'philosophy',
    difficulty: 'hard',
    length: 'medium',
    language: 'english'
  }
];

export interface GenerateTextOptions {
  mode: 'time' | 'words' | 'quote' | 'custom';
  targetDuration?: number;
  targetWordCount?: number;
  wordList?: string[];
  punctuation?: boolean;
  numbers?: boolean;
  difficulty?: TestDifficulty;
  customText?: string;
  quoteLength?: 'short' | 'medium' | 'long' | 'random';
  seed?: string | number;
}

/**
 * Applies realistic punctuation to words (sentences, capitalization, commas, quotes, periods)
 */
export function applyPunctuation(words: string[], rng: SeededRandom): string[] {
  const result: string[] = [];
  let startOfSentence = true;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    if (startOfSentence) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
      startOfSentence = false;
    }

    // Determine sentence terminator or mid-sentence punctuation
    const isEnd = i === words.length - 1;
    const rand = rng.next();

    if (isEnd) {
      word += '.';
    } else if (rand < 0.12) {
      // End sentence
      const punct = rng.next() < 0.8 ? '.' : rng.next() < 0.5 ? '?' : '!';
      word += punct;
      startOfSentence = true;
    } else if (rand < 0.24) {
      word += ',';
    } else if (rand < 0.28) {
      word += ';';
    } else if (rand < 0.32) {
      // Quoted word
      word = `"${word}"`;
    } else if (rand < 0.35) {
      word = `(${word})`;
    }

    result.push(word);
  }

  return result;
}

/**
 * Injects realistic numbers into words (integers, years, decimals, percentages)
 */
export function applyNumbers(words: string[], rng: SeededRandom): string[] {
  const result: string[] = [];
  const years = [1984, 1999, 2001, 2012, 2020, 2024, 2026, 2030];
  let numbersAdded = 0;

  for (let i = 0; i < words.length; i++) {
    result.push(words[i]);

    // Insert a number every ~5-8 words or guarantee at least one if none added yet near the end
    const shouldInsert =
      (rng.next() < 0.20 && i < words.length - 1) ||
      (i === Math.floor(words.length / 2) && numbersAdded === 0);

    if (shouldInsert) {
      numbersAdded++;
      const type = rng.nextInt(1, 4);
      let numStr = '';
      if (type === 1) {
        numStr = rng.pick(years).toString();
      } else if (type === 2) {
        numStr = rng.nextInt(1, 999).toString();
      } else if (type === 3) {
        numStr = `${rng.nextInt(1, 99)}%`;
      } else {
        numStr = `${rng.nextInt(1, 99)}.${rng.nextInt(1, 99)}`;
      }
      result.push(numStr);
    }
  }

  return result;
}

/**
 * Filter words by difficulty
 */
export function filterByDifficulty(words: string[], difficulty: TestDifficulty = 'normal'): string[] {
  switch (difficulty) {
    case 'easy':
      return words.filter((w) => w.length <= 4);
    case 'normal':
      return words.filter((w) => w.length >= 3 && w.length <= 8);
    case 'hard':
      return words.filter((w) => w.length >= 6);
    case 'expert':
      return words.filter((w) => w.length >= 7 || /[A-Z]/.test(w));
    default:
      return words;
  }
}

/**
 * Main prompt generator
 */
export function generatePrompt(options: GenerateTextOptions): string {
  if (options.mode === 'custom' && options.customText) {
    return options.customText.trim();
  }

  const rng = new SeededRandom(options.seed !== undefined ? options.seed : Math.random());

  if (options.mode === 'quote') {
    let quotes = CURATED_QUOTES;
    if (options.quoteLength && options.quoteLength !== 'random') {
      quotes = quotes.filter((q) => q.length === options.quoteLength);
      if (quotes.length === 0) quotes = CURATED_QUOTES;
    }
    const chosen = rng.pick(quotes);
    return chosen.text;
  }

  const baseWords = options.wordList && options.wordList.length > 0 ? options.wordList : CORE_ENGLISH_WORDS;
  const filteredWords = filterByDifficulty(baseWords, options.difficulty || 'normal');
  const pool = filteredWords.length > 20 ? filteredWords : baseWords;

  // Determine count
  let count = 25;
  if (options.mode === 'words') {
    count = options.targetWordCount || 25;
  } else if (options.mode === 'time') {
    // For time tests, provide sufficient buffer (e.g. 3-4 words per second)
    const duration = options.targetDuration || 30;
    count = Math.max(50, Math.ceil(duration * 3.5));
  }

  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(rng.pick(pool));
  }

  let finalWords = picked;

  if (options.numbers) {
    finalWords = applyNumbers(finalWords, rng);
  }

  if (options.punctuation) {
    finalWords = applyPunctuation(finalWords, rng);
  }

  return finalWords.join(' ');
}
