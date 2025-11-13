import type { Pool } from '../../domain/pools/pool.entity';

export const POOL_REPOSITORY = Symbol('POOL_REPOSITORY');

export interface PoolRepositoryPort {
  save(pool: Pool): Promise<Pool>;
  findByAddress(address: string): Promise<Pool | null>;
  findAll(filters?: { dex?: string; isActive?: boolean }): Promise<Pool[]>;
  findById(id: string): Promise<Pool | null>;
  saveHistoricalData(data: {
    poolId: string;
    timestamp: Date;
    reserve0: string;
    reserve1: string;
    tvl?: string;
    volume?: string;
    price?: string;
  }): Promise<void>;
  getHistoricalData(poolId: string, from: Date, to: Date): Promise<Array<{
    timestamp: Date;
    reserve0: string;
    reserve1: string;
    tvl?: string;
    volume?: string;
    price?: string;
  }>>;
}

