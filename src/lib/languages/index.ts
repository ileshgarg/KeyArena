import { LanguageDefinition } from './types';
import { englishLanguage } from './data/english';
import {
  dutchLanguage,
  frenchLanguage,
  germanLanguage,
  hindiLanguage,
  indonesianLanguage,
  italianLanguage,
  polishLanguage,
  portugueseLanguage,
  russianLanguage,
  spanishLanguage,
  turkishLanguage
} from './data/international';

export * from './types';

export const ALL_LANGUAGES: LanguageDefinition[] = [
  englishLanguage,
  hindiLanguage,
  spanishLanguage,
  frenchLanguage,
  germanLanguage,
  italianLanguage,
  portugueseLanguage,
  dutchLanguage,
  russianLanguage,
  polishLanguage,
  turkishLanguage,
  indonesianLanguage
];

export function getLanguage(id: string): LanguageDefinition {
  const found = ALL_LANGUAGES.find((lang) => lang.id.toLowerCase() === id.toLowerCase());
  return found || englishLanguage;
}

export function getWordsForLanguage(
  languageId: string,
  size: '1k' | '5k' | '10k' = '1k'
): string[] {
  const lang = getLanguage(languageId);
  if (size === '5k' && lang.words['5k'] && lang.words['5k'].length > 0) {
    return [...lang.words['1k'], ...lang.words['5k']];
  }
  return lang.words['1k'];
}
