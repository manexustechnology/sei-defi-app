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
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <PoolList dictionary={dictionary.pools} />
    </main>
  );
}

export const metadata = {
  title: 'Liquidity Pools | Manexus Trading Bot',
  description: 'Track liquidity pools from DragonSwap and Sailor Finance',
};

