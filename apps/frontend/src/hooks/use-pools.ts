'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

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

/**
 * Fetch liquidity pools from the backend
 * @param dex - Optional filter by DEX (dragonswap or sailor)
 */
export function usePools(dex?: 'dragonswap' | 'sailor') {
  return useQuery({
    queryKey: ['pools', dex],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dex) params.append('dex', dex);

      const endpoint = `/pools${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await apiFetch<ApiResponse<Pool[]>>(endpoint);
      return result.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch historical data for a specific pool
 * @param poolId - Pool ID
 * @param from - Start date
 * @param to - End date
 */
export function usePoolHistory(poolId: string, from: Date, to: Date) {
  return useQuery({
    queryKey: ['pool-history', poolId, from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
      });

      const endpoint = `/pools/${poolId}/history?${params.toString()}`;
      const result = await apiFetch<ApiResponse<PoolHistoricalData[]>>(endpoint);
      return result.data;
    },
    enabled: !!poolId,
    staleTime: 60000, // 1 minute
  });
}

