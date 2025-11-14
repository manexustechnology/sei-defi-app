import { PoolList } from '@/components/pools/pool-list';
import { TopNav } from '@/components/trading/top-nav';
import { getDictionary } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

export default async function PoolsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <TopNav />

      {/* Pools Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <PoolList dictionary={dictionary.pools} />
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Liquidity Pools | Manexus Trading Bot',
  description: 'Track liquidity pools from DragonSwap and Sailor Finance',
};

