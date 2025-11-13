'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavigationProps = {
  locale: string;
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
    <nav className="border-b">
      <div className="mx-auto flex max-w-7xl gap-6 px-6">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'border-b-2 py-4 text-sm font-medium transition-colors hover:text-primary',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

