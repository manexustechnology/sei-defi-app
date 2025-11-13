'use client';

import { useQuery } from '@tanstack/react-query';

export type Pool = {
  id: string;
  poolAddress: string;
  dex: 'dragonswap' | 'sailor';
  token0: string;
  token1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  feeTier?: string;
  tvl?: string;
  volume24h?: string;
  apr?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PoolHistoricalData = {
  timestamp: string;
  reserve0: string;
  reserve1: string;
  tvl?: string;
  volume?: string;
  price?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
};

export function usePools(dex?: 'dragonswap' | 'sailor') {
  return useQuery({
    queryKey: ['pools', dex],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dex) params.append('dex', dex);

      const response = await fetch(`/api/pools?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pools');
      }

      const result: ApiResponse<Pool[]> = await response.json();
      return result.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function usePoolHistory(poolId: string, from: Date, to: Date) {
  return useQuery({
    queryKey: ['pool-history', poolId, from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
      });

      const response = await fetch(`/api/pools/${poolId}/history?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pool history');
      }

      const result: ApiResponse<PoolHistoricalData[]> = await response.json();
      return result.data;
    },
    enabled: !!poolId,
    staleTime: 60000, // 1 minute
  });
}

