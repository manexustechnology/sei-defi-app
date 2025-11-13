'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n/config';

type LanguageSwitcherProps = {
  label: string;
  activeLocale: Locale;
};

export function LanguageSwitcher({ label, activeLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathWithoutLocale = pathname.split('/').slice(2).join('/');

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {locales.map((locale) => {
          const isActive = locale === activeLocale;
          const href = `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;

          return (
            <Button
              key={locale}
              asChild
              size="sm"
              variant={isActive ? 'default' : 'outline'}
            >
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'pointer-events-none' : ''}
              >
                {locale.toUpperCase()}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
