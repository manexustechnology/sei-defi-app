import { Inject, Injectable, Logger } from '@nestjs/common';

import { DragonSwapClient, type DragonSwapPoolData } from '../../../infrastructure/dex/dragonswap.client';
import { SailorClient, type SailorPoolData } from '../../../infrastructure/dex/sailor.client';
import { Pool } from '../../domain/pools/pool.entity';
import type { PoolRepositoryPort } from '../ports/pool-repository.port';
import { POOL_REPOSITORY } from '../ports/pool-repository.port';

type PoolData = DragonSwapPoolData | SailorPoolData;

@Injectable()
export class SyncPoolsUseCase {
  private readonly logger = new Logger(SyncPoolsUseCase.name);

  constructor(
    private readonly dragonSwapClient: DragonSwapClient,
    private readonly sailorClient: SailorClient,
    @Inject(POOL_REPOSITORY)
    private readonly poolRepository: PoolRepositoryPort,
  ) {}

  async execute(): Promise<{ synced: number; errors: number }> {
    this.logger.log('Starting pool synchronization...');

    let syncedCount = 0;
    let errorCount = 0;

    try {
      // Fetch pools from DragonSwap
      const dragonPools = await this.dragonSwapClient.fetchPools();
      this.logger.log(`Fetched ${dragonPools.length} pools from DragonSwap`);

      for (const poolData of dragonPools) {
        try {
          await this.syncPool(poolData, 'dragonswap');
          syncedCount++;
        } catch (error) {
          this.logger.error(`Failed to sync DragonSwap pool ${poolData.address}`, error);
          errorCount++;
        }
      }

      // Fetch pools from Sailor Finance
      const sailorPools = await this.sailorClient.fetchPools();
      this.logger.log(`Fetched ${sailorPools.length} pools from Sailor Finance`);

      for (const poolData of sailorPools) {
        try {
          await this.syncPool(poolData, 'sailor');
          syncedCount++;
        } catch (error) {
          this.logger.error(`Failed to sync Sailor pool ${poolData.address}`, error);
          errorCount++;
        }
      }

      this.logger.log(`Pool synchronization complete: ${syncedCount} synced, ${errorCount} errors`);

      return { synced: syncedCount, errors: errorCount };
    } catch (error) {
      this.logger.error('Pool synchronization failed', error);
      throw error;
    }
  }

  private async syncPool(poolData: PoolData, dex: 'dragonswap' | 'sailor'): Promise<void> {
    // Check if pool already exists
    const existingPool = await this.poolRepository.findByAddress(poolData.address);

    if (existingPool) {
      // Update existing pool with new metrics
      const updatedPool = existingPool.updateMetrics(
        poolData.tvlUSD,
        poolData.volumeUSD24h,
        poolData.apr,
      );
      await this.poolRepository.save(updatedPool);
      this.logger.debug(`Updated pool ${poolData.address}`);
    } else {
      // Create new pool
      const newPool = Pool.create({
        poolAddress: poolData.address,
        dex,
        token0: poolData.token0.address,
        token1: poolData.token1.address,
        token0Symbol: poolData.token0.symbol,
        token1Symbol: poolData.token1.symbol,
        feeTier: poolData.feeTier,
        tvl: poolData.tvlUSD,
        volume24h: poolData.volumeUSD24h,
        apr: poolData.apr,
        metadata: {
          reserve0: poolData.reserve0,
          reserve1: poolData.reserve1,
          totalSupply: poolData.totalSupply,
          token0Decimals: poolData.token0.decimals,
          token1Decimals: poolData.token1.decimals,
        },
        isActive: true,
      });

      await this.poolRepository.save(newPool);
      this.logger.debug(`Created new pool ${poolData.address}`);
    }
  }
}

