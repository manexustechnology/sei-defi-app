'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePools, type Pool } from '@/hooks/use-pools';

type PoolListProps = {
  dictionary: {
    title: string;
    subtitle: string;
    loading: string;
    empty: string;
    error: string;
    retry: string;
    all: string;
    dragonswap: string;
    sailor: string;
    tvl: string;
    volume24h: string;
    apr: string;
    pairName: string;
    feeTier: string;
  };
};

export function PoolList({ dictionary }: PoolListProps) {
  const [dexFilter, setDexFilter] = useState<'all' | 'dragonswap' | 'sailor'>('all');
  const { data: pools, isLoading, error, refetch, isFetching } = usePools(
    dexFilter === 'all' ? undefined : dexFilter
  );

  const formatNumber = (value: string | undefined, decimals = 2) => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const sortedPools = useMemo(() => {
    if (!pools) return [];
    return [...pools].sort((a, b) => {
      const tvlA = parseFloat(a.tvl || '0');
      const tvlB = parseFloat(b.tvl || '0');
      return tvlB - tvlA;
    });
  }, [pools]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-sm text-muted-foreground">{dictionary.error}</p>
          <Button onClick={() => refetch()} variant="outline">
            {dictionary.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{dictionary.title}</h2>
          <p className="text-sm text-muted-foreground">{dictionary.subtitle}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={dexFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setDexFilter('all')}
          >
            {dictionary.all}
          </Button>
          <Button
            size="sm"
            variant={dexFilter === 'dragonswap' ? 'default' : 'outline'}
            onClick={() => setDexFilter('dragonswap')}
          >
            {dictionary.dragonswap}
          </Button>
          <Button
            size="sm"
            variant={dexFilter === 'sailor' ? 'default' : 'outline'}
            onClick={() => setDexFilter('sailor')}
          >
            {dictionary.sailor}
          </Button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 w-32 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedPools.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{dictionary.empty}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} dictionary={dictionary} formatNumber={formatNumber} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}
    </div>
  );
}

type PoolCardProps = {
  pool: Pool;
  dictionary: PoolListProps['dictionary'];
  formatNumber: (value: string | undefined, decimals?: number) => string;
  formatCurrency: (value: string | undefined) => string;
};

function PoolCard({ pool, dictionary, formatNumber, formatCurrency }: PoolCardProps) {
  const pairName = pool.token0Symbol && pool.token1Symbol
    ? `${pool.token0Symbol}/${pool.token1Symbol}`
    : `${pool.token0.slice(0, 6)}.../${pool.token1.slice(0, 6)}...`;

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{pairName}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant={pool.dex === 'dragonswap' ? 'default' : 'secondary'}>
                {pool.dex === 'dragonswap' ? dictionary.dragonswap : dictionary.sailor}
              </Badge>
              {pool.feeTier && (
                <Badge variant="outline" className="ml-2">
                  {pool.feeTier}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dictionary.tvl}</dt>
            <dd className="font-semibold">{formatCurrency(pool.tvl)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dictionary.volume24h}</dt>
            <dd className="font-semibold">{formatCurrency(pool.volume24h)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dictionary.apr}</dt>
            <dd className="font-semibold text-green-600">
              {pool.apr ? `${formatNumber(pool.apr)}%` : '—'}
            </dd>
          </div>
        </dl>
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="truncate">{pool.poolAddress}</p>
        </div>
      </CardContent>
    </Card>
  );
}

