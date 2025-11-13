'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePoolHistory, type Pool } from '@/hooks/use-pools';
import { PoolChart } from './pool-chart';

type PoolDetailProps = {
  pool: Pool;
  dictionary: {
    details: {
      title: string;
      address: string;
      tokens: string;
      feeTier: string;
      dex: string;
    };
    chart: {
      title: string;
      tvl: string;
      volume: string;
      reserves: string;
      price: string;
    };
    timeRange: {
      label: string;
      day: string;
      week: string;
      month: string;
    };
    loading: string;
    error: string;
    retry: string;
  };
};

type TimeRange = '1d' | '7d' | '30d';

export function PoolDetail({ pool, dictionary }: PoolDetailProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const getDateRange = (range: TimeRange): { from: Date; to: Date } => {
    const to = new Date();
    const from = new Date();

    switch (range) {
      case '1d':
        from.setDate(from.getDate() - 1);
        break;
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
    }

    return { from, to };
  };

  const { from, to } = getDateRange(timeRange);
  const { data, isLoading, error, refetch } = usePoolHistory(pool.id, from, to);

  const pairName =
    pool.token0Symbol && pool.token1Symbol
      ? `${pool.token0Symbol}/${pool.token1Symbol}`
      : `${pool.token0.slice(0, 6)}.../${pool.token1.slice(0, 6)}...`;

  if (error) {
    return (
      <div className="space-y-4">
        <PoolInfoCard pool={pool} pairName={pairName} dictionary={dictionary.details} />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-sm text-muted-foreground">{dictionary.error}</p>
            <Button onClick={() => refetch()} variant="outline">
              {dictionary.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PoolInfoCard pool={pool} pairName={pairName} dictionary={dictionary.details} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{dictionary.timeRange.label}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeRange === '1d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('1d')}
            >
              {dictionary.timeRange.day}
            </Button>
            <Button
              size="sm"
              variant={timeRange === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('7d')}
            >
              {dictionary.timeRange.week}
            </Button>
            <Button
              size="sm"
              variant={timeRange === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('30d')}
            >
              {dictionary.timeRange.month}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{dictionary.loading}</p>
          </CardContent>
        </Card>
      ) : (
        <PoolChart data={data || []} dictionary={dictionary.chart} />
      )}
    </div>
  );
}

function PoolInfoCard({
  pool,
  pairName,
  dictionary,
}: {
  pool: Pool;
  pairName: string;
  dictionary: PoolDetailProps['dictionary']['details'];
}) {
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

  const formatNumber = (value: string | undefined, decimals = 2) => {
    if (!value) return '—';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{pairName}</CardTitle>
            <CardDescription className="mt-2 flex gap-2">
              <Badge variant={pool.dex === 'dragonswap' ? 'default' : 'secondary'}>
                {pool.dex === 'dragonswap' ? 'DragonSwap' : 'Sailor Finance'}
              </Badge>
              {pool.feeTier && <Badge variant="outline">{pool.feeTier}</Badge>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">TVL</dt>
            <dd className="text-2xl font-bold">{formatCurrency(pool.tvl)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">24h Volume</dt>
            <dd className="text-2xl font-bold">{formatCurrency(pool.volume24h)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">APR</dt>
            <dd className="text-2xl font-bold text-green-600">
              {pool.apr ? `${formatNumber(pool.apr)}%` : '—'}
            </dd>
          </div>
        </dl>
        <div className="mt-6 space-y-2 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{dictionary.address}</p>
            <p className="font-mono text-sm">{pool.poolAddress}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dictionary.tokens}</p>
            <p className="font-mono text-sm">
              {pool.token0} / {pool.token1}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

