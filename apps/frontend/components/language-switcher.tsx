'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

import { locales, type Locale } from '@/i18n/config';

type LanguageSwitcherProps = {
  label?: string;
  activeLocale: Locale;
};

const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Indonesian',
};

export function LanguageSwitcher({ activeLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathWithoutLocale = pathname.split('/').slice(2).join('/');

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        const href = `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

        if (!isActive) return null;

        return (
          <div
            key={locale}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50"
          >
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {localeNames[locale]}
            </span>
          </div>
        );
      })}
      
      {/* Hidden language options - shown on hover/click */}
      <div className="relative group">
        <button className="p-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden">
            {locales.map((locale) => {
              const isActive = locale === activeLocale;
              const href = `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

              return (
                <Link
                  key={locale}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium pointer-events-none'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <Languages className="h-3.5 w-3.5" />
                  {localeNames[locale]}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
