import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TypingTestResult } from '@keyarena/typing-engine';
import { KeyArenaTheme } from '../themes';

export interface LocalProfile {
  id: string;
  displayName: string;
  avatarColor: string;
  createdAt: string;
}

export interface LocalStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoal: number; // minutes or tests
  todayCompletedCount: number;
}

export interface LocalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  category: 'tests' | 'speed' | 'accuracy' | 'streaks';
}

export interface KeyArenaDBSchema extends DBSchema {
  tests: {
    key: string;
    value: TypingTestResult;
    indexes: {
      'by-date': string;
      'by-mode': string;
      'by-wpm': number;
    };
  };
  personal_bests: {
    key: string; // e.g. "time_15", "time_30", "time_60", "words_25", "words_50"
    value: {
      categoryKey: string;
      wpm: number;
      rawWpm: number;
      accuracy: number;
      consistency: number;
      testId: string;
      achievedAt: string;
    };
  };
  custom_themes: {
    key: string;
    value: KeyArenaTheme;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'keyarena_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KeyArenaDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<KeyArenaDBSchema>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable on server'));
  }

  if (!dbPromise) {
    dbPromise = openDB<KeyArenaDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tests store
        if (!db.objectStoreNames.contains('tests')) {
          const testStore = db.createObjectStore('tests', { keyPath: 'id' });
          testStore.createIndex('by-date', 'completedAt');
          testStore.createIndex('by-mode', 'config.mode');
          testStore.createIndex('by-wpm', 'wpm');
        }

        // Personal bests
        if (!db.objectStoreNames.contains('personal_bests')) {
          db.createObjectStore('personal_bests', { keyPath: 'categoryKey' });
        }

        // Custom themes
        if (!db.objectStoreNames.contains('custom_themes')) {
          db.createObjectStore('custom_themes', { keyPath: 'id' });
        }

        // Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      }
    });
  }
  return dbPromise;
}

export const INITIAL_ACHIEVEMENTS: LocalAchievement[] = [
  { id: 'first_test', title: 'First Keystroke', description: 'Complete your first typing test', icon: 'zap', unlockedAt: null, category: 'tests' },
  { id: 'tests_10', title: 'Finding the Flow', description: 'Complete 10 typing tests', icon: 'award', unlockedAt: null, category: 'tests' },
  { id: 'tests_100', title: 'Centurion', description: 'Complete 100 typing tests', icon: 'shield', unlockedAt: null, category: 'tests' },
  { id: 'tests_1000', title: 'Grand Master', description: 'Complete 1,000 typing tests', icon: 'crown', unlockedAt: null, category: 'tests' },
  { id: 'wpm_50', title: 'Cruising Speed', description: 'Reach 50 WPM in any test', icon: 'flame', unlockedAt: null, category: 'speed' },
  { id: 'wpm_75', title: 'Swift Reflexes', description: 'Reach 75 WPM in any test', icon: 'activity', unlockedAt: null, category: 'speed' },
  { id: 'wpm_100', title: 'Triple Digits', description: 'Break the 100 WPM barrier', icon: 'trending-up', unlockedAt: null, category: 'speed' },
  { id: 'wpm_120', title: 'Speed Demon', description: 'Surpass 120 WPM', icon: 'cpu', unlockedAt: null, category: 'speed' },
  { id: 'acc_95', title: 'Sharp Shooter', description: 'Complete a test with ≥ 95% accuracy', icon: 'target', unlockedAt: null, category: 'accuracy' },
  { id: 'acc_98', title: 'Precision Engineer', description: 'Complete a test with ≥ 98% accuracy', icon: 'check-circle', unlockedAt: null, category: 'accuracy' },
  { id: 'acc_100', title: 'Flawless Execution', description: 'Complete a test with 100% accuracy', icon: 'star', unlockedAt: null, category: 'accuracy' },
  { id: 'streak_7', title: 'Weekly Habit', description: 'Maintain a 7-day practice streak', icon: 'calendar', unlockedAt: null, category: 'streaks' },
  { id: 'streak_30', title: 'Consistent Dedication', description: 'Maintain a 30-day practice streak', icon: 'compass', unlockedAt: null, category: 'streaks' }
];

export async function saveTestResult(result: TypingTestResult): Promise<{ isNewPb: boolean; newAchievements: string[] }> {
  const db = await getDb();
  await db.put('tests', result);

  // Check and update Personal Bests
  let isNewPb = false;
  let pbKey = `${result.config.mode}`;
  if (result.config.mode === 'time') {
    pbKey = `time_${result.config.targetDuration || 30}`;
  } else if (result.config.mode === 'words') {
    pbKey = `words_${result.config.targetWordCount || 25}`;
  }

  const existingPb = await db.get('personal_bests', pbKey);
  if (!existingPb || result.wpm > existingPb.wpm) {
    await db.put('personal_bests', {
      categoryKey: pbKey,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      testId: result.id,
      achievedAt: result.completedAt
    });
    isNewPb = true;
  }

  // Update streak
  await updateStreakOnTest();

  // Check achievements
  const allTests = await db.getAll('tests');
  const unlocked = await evaluateAchievements(result, allTests.length);

  return { isNewPb, newAchievements: unlocked };
}

export async function getAllTests(): Promise<TypingTestResult[]> {
  try {
    const db = await getDb();
    const tests = await db.getAll('tests');
    return tests.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch {
    return [];
  }
}

export async function deleteTest(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('tests', id);
}

export async function clearAllTests(): Promise<void> {
  const db = await getDb();
  await db.clear('tests');
  await db.clear('personal_bests');
}

export async function getPersonalBests(): Promise<Record<string, { wpm: number; accuracy: number; achievedAt: string }>> {
  try {
    const db = await getDb();
    const list = await db.getAll('personal_bests');
    const map: Record<string, { wpm: number; accuracy: number; achievedAt: string }> = {};
    for (const item of list) {
      map[item.categoryKey] = item;
    }
    return map;
  } catch {
    return {};
  }
}

// Streaks Management
const STREAK_STORAGE_KEY = 'keyarena_streak';

export function getStreak(): LocalStreak {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', dailyGoal: 10, todayCompletedCount: 0 };
  }
  const raw = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!raw) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', dailyGoal: 10, todayCompletedCount: 0 };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', dailyGoal: 10, todayCompletedCount: 0 };
  }
}

export async function updateStreakOnTest(): Promise<LocalStreak> {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];

  if (streak.lastActiveDate === today) {
    streak.todayCompletedCount++;
  } else {
    // Check if yesterday was active
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastActiveDate === yesterdayDate) {
      streak.currentStreak++;
    } else {
      streak.currentStreak = 1;
    }
    streak.lastActiveDate = today;
    streak.todayCompletedCount = 1;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  }
  return streak;
}

// Achievements
const ACHIEVEMENTS_STORAGE_KEY = 'keyarena_achievements';

export function getAchievements(): LocalAchievement[] {
  if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
  const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
  if (!raw) return INITIAL_ACHIEVEMENTS;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    return INITIAL_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlockedAt: map[a.id] || null
    }));
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

async function evaluateAchievements(latest: TypingTestResult, totalTests: number): Promise<string[]> {
  const achievements = getAchievements();
  const streak = getStreak();
  const newlyUnlocked: string[] = [];
  const map: Record<string, string> = {};

  for (const a of achievements) {
    if (a.unlockedAt) {
      map[a.id] = a.unlockedAt;
      continue;
    }

    let isUnlocked = false;
    if (a.id === 'first_test' && totalTests >= 1) isUnlocked = true;
    if (a.id === 'tests_10' && totalTests >= 10) isUnlocked = true;
    if (a.id === 'tests_100' && totalTests >= 100) isUnlocked = true;
    if (a.id === 'tests_1000' && totalTests >= 1000) isUnlocked = true;

    if (a.id === 'wpm_50' && latest.wpm >= 50) isUnlocked = true;
    if (a.id === 'wpm_75' && latest.wpm >= 75) isUnlocked = true;
    if (a.id === 'wpm_100' && latest.wpm >= 100) isUnlocked = true;
    if (a.id === 'wpm_120' && latest.wpm >= 120) isUnlocked = true;

    if (a.id === 'acc_95' && latest.accuracy >= 95) isUnlocked = true;
    if (a.id === 'acc_98' && latest.accuracy >= 98) isUnlocked = true;
    if (a.id === 'acc_100' && latest.accuracy >= 100) isUnlocked = true;

    if (a.id === 'streak_7' && streak.currentStreak >= 7) isUnlocked = true;
    if (a.id === 'streak_30' && streak.currentStreak >= 30) isUnlocked = true;

    if (isUnlocked) {
      const now = new Date().toISOString();
      map[a.id] = now;
      newlyUnlocked.push(a.title);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(map));
  }

  return newlyUnlocked;
}

// Local Profile
const PROFILE_STORAGE_KEY = 'keyarena_local_profile';

export function getLocalProfile(): LocalProfile {
  if (typeof window === 'undefined') {
    return { id: 'anon', displayName: 'Anonymous Pilot', avatarColor: '#FFFFFF', createdAt: new Date().toISOString() };
  }
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    const initial: LocalProfile = {
      id: `pilot_${Math.random().toString(36).substring(2, 8)}`,
      displayName: 'Anonymous Pilot',
      avatarColor: '#FFFFFF',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { id: 'anon', displayName: 'Anonymous Pilot', avatarColor: '#FFFFFF', createdAt: new Date().toISOString() };
  }
}

export function saveLocalProfile(profile: Partial<LocalProfile>): LocalProfile {
  const current = getLocalProfile();
  const updated = { ...current, ...profile };
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

// Full Data Export / Import
export async function exportAllData(): Promise<string> {
  const db = await getDb();
  const tests = await db.getAll('tests');
  const personalBests = await db.getAll('personal_bests');
  const customThemes = await db.getAll('custom_themes');
  const streak = getStreak();
  const profile = getLocalProfile();
  const achievements = getAchievements();

  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile,
    streak,
    achievements,
    tests,
    personalBests,
    customThemes
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    const db = await getDb();

    if (Array.isArray(data.tests)) {
      for (const t of data.tests) {
        await db.put('tests', t);
      }
    }

    if (Array.isArray(data.personalBests)) {
      for (const pb of data.personalBests) {
        await db.put('personal_bests', pb);
      }
    }

    if (data.profile) {
      saveLocalProfile(data.profile);
    }

    if (data.streak && typeof window !== 'undefined') {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data.streak));
    }

    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
