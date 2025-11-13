import { PoolList } from '@/components/pools/pool-list';
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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PoolList dictionary={dictionary.pools} />
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Liquidity Pools | Manexus Trading Bot',
  description: 'Track liquidity pools from DragonSwap and Sailor Finance',
};

