export interface LanguageDefinition {
  id: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
  words: {
    '1k': string[];
    '5k'?: string[];
    '10k'?: string[];
  };
}
