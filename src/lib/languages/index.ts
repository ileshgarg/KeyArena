import { LanguageDefinition } from './types';
import { englishLanguage } from './data/english';

export * from './types';

export const ALL_LANGUAGES: LanguageDefinition[] = [
  englishLanguage
];

export function getLanguage(id?: string): LanguageDefinition {
  return englishLanguage;
}

export function getWordsForLanguage(
  languageId?: string,
  size: '1k' | '5k' | '10k' = '1k'
): string[] {
  const lang = englishLanguage;
  if (size === '5k' && lang.words['5k'] && lang.words['5k'].length > 0) {
    return [...lang.words['1k'], ...lang.words['5k']];
  }
  return lang.words['1k'];
}

