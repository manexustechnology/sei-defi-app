import en from './dictionaries/en.json';
import id from './dictionaries/id.json';

export const locales = ['en', 'id'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const dictionaries = {
  en,
  id,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}
