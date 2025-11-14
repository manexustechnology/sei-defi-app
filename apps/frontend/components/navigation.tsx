'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { type Locale } from '@/i18n/config';

type NavigationProps = {
  locale: Locale;
  links: {
    dashboard: string;
    pools: string;
  };
};

export function Navigation({ locale, links }: NavigationProps) {
  const pathname = usePathname();
  const basePath = `/${locale}`;

  const navItems = [
    { href: basePath, label: links.dashboard, exact: true },
    { href: `${basePath}/pools`, label: links.pools },
  ];

  return (
    <nav className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Left: Navigation Links */}
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative border-b-2 px-4 py-4 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

