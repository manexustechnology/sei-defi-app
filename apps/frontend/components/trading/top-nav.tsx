'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  BarChart3,
  Activity,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/locale-provider';

export function TopNav() {
  const { locale } = useLocale();
  const pathname = usePathname();

  const isActivePage = (path: string) => {
    if (path === `/${locale}`) {
      return (
        pathname === `/${locale}` || pathname === '/en' || pathname === '/id'
      );
    }
    return pathname.startsWith(path);
  };

  const features = [
    { name: 'Trade', href: `/${locale}`, icon: TrendingUp },
    { name: 'Pools', href: `/${locale}/pools`, icon: Droplets },
    { name: 'Portfolio', href: `/${locale}/portfolio`, icon: Wallet },
    { name: 'Markets', href: `/${locale}/markets`, icon: BarChart3 },
    { name: 'Activity', href: `/${locale}/activity`, icon: Activity },
  ];

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left: Logo & Feature Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-base font-bold bg-gradient-to-r from-blue-500 to-slate-300 bg-clip-text text-transparent">
              Nexus
            </span>
          </Link>

          {/* Feature Links */}
          <nav className="flex items-center gap-1">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = isActivePage(feature.href);
              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {feature.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Additional Links */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs">
            <Link
              href={`/${locale}/rewards`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Rewards
            </Link>
            <Link
              href={`/${locale}/leaderboard`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href={`/${locale}/docs`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
