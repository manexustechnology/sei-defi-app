'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';

import type { Dictionary, Locale } from '@/i18n/config';

interface DictionaryRecord {
  [key: string]: string | DictionaryRecord;
}

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveTranslation(key: string, dictionary: DictionaryRecord): string | undefined {
  return key.split('.').reduce<string | DictionaryRecord | undefined>((acc, part) => {
    if (!acc) {
      return undefined;
    }

    if (typeof acc === 'string') {
      return acc;
    }

    return acc[part];
  }, dictionary) as string | undefined;
}

type LocaleProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export function LocaleProvider({ locale, dictionary, children }: LocaleProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    dictionary,
    t: (key: string) => resolveTranslation(key, dictionary as DictionaryRecord) ?? key,
  }), [locale, dictionary]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}
