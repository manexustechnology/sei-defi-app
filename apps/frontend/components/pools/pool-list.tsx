'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

  const totalTVL = useMemo(() => {
    if (!sortedPools) return 0;
    return sortedPools.reduce((sum, pool) => sum + parseFloat(pool.tvl || '0'), 0);
  }, [sortedPools]);

  const totalVolume = useMemo(() => {
    if (!sortedPools) return 0;
    return sortedPools.reduce((sum, pool) => sum + parseFloat(pool.volume24h || '0'), 0);
  }, [sortedPools]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {dictionary.title}
          </h1>
          <p className="text-muted-foreground">{dictionary.subtitle}</p>
        </div>

        {/* Stats Cards */}
        {!isLoading && sortedPools.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="luxury-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total TVL</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalTVL.toString())}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalVolume.toString())}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Pools</p>
                    <p className="text-2xl font-bold">{sortedPools.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={dexFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setDexFilter('all')}
            className="font-medium"
          >
            {dictionary.all}
          </Button>
          <Button
            size="sm"
            variant={dexFilter === 'dragonswap' ? 'default' : 'outline'}
            onClick={() => setDexFilter('dragonswap')}
            className="font-medium"
          >
            {dictionary.dragonswap}
          </Button>
          <Button
            size="sm"
            variant={dexFilter === 'sailor' ? 'default' : 'outline'}
            onClick={() => setDexFilter('sailor')}
            className="font-medium"
          >
            {dictionary.sailor}
          </Button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="luxury-card border-0 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedPools.length === 0 ? (
        <Card className="luxury-card border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">{dictionary.empty}</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for updated pool data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

  const tvlValue = parseFloat(pool.tvl || '0');
  const volumeValue = parseFloat(pool.volume24h || '0');
  const aprValue = parseFloat(pool.apr || '0');

  return (
    <Card className="luxury-card border-0 group hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold">{pairName}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={pool.dex === 'dragonswap' ? 'default' : 'secondary'}
                className="font-medium"
              >
                {pool.dex === 'dragonswap' ? dictionary.dragonswap : dictionary.sailor}
              </Badge>
              {pool.feeTier && (
                <Badge variant="outline" className="border-primary/20">
                  {pool.feeTier}
                </Badge>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <dt className="text-sm font-medium text-muted-foreground">{dictionary.tvl}</dt>
            </div>
            <dd className="text-sm font-bold">{formatCurrency(pool.tvl)}</dd>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <dt className="text-sm font-medium text-muted-foreground">{dictionary.volume24h}</dt>
            </div>
            <dd className="text-sm font-bold">{formatCurrency(pool.volume24h)}</dd>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-2">
              {aprValue > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              )}
              <dt className="text-sm font-medium text-muted-foreground">{dictionary.apr}</dt>
            </div>
            <dd className="text-sm font-bold text-green-600">
              {pool.apr ? `${formatNumber(pool.apr)}%` : '—'}
            </dd>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {pool.poolAddress}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

