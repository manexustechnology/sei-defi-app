import { Inject, Injectable, Logger } from '@nestjs/common';

import type { PoolRepositoryPort } from '../ports/pool-repository.port';
import { POOL_REPOSITORY } from '../ports/pool-repository.port';

@Injectable()
export class RecordPoolHistoryUseCase {
  private readonly logger = new Logger(RecordPoolHistoryUseCase.name);

  constructor(
    @Inject(POOL_REPOSITORY)
    private readonly poolRepository: PoolRepositoryPort,
  ) {}

  async execute(): Promise<{ recorded: number; errors: number }> {
    this.logger.log('Recording pool historical snapshots...');

    let recordedCount = 0;
    let errorCount = 0;

    try {
      // Get all active pools
      const pools = await this.poolRepository.findAll({ isActive: true });
      this.logger.log(`Recording history for ${pools.length} active pools`);

      const now = new Date();

      for (const pool of pools) {
        try {
          const snapshot = pool.snapshot();

          // Extract reserve data from metadata
          const metadata = snapshot.metadata as any;
          const reserve0 = metadata?.reserve0 || '0';
          const reserve1 = metadata?.reserve1 || '0';

          // Calculate price (token0/token1)
          let price: string | undefined;
          if (reserve0 && reserve1) {
            const r0 = parseFloat(reserve0);
            const r1 = parseFloat(reserve1);
            if (r1 > 0) {
              price = (r0 / r1).toString();
            }
          }

          await this.poolRepository.saveHistoricalData({
            poolId: snapshot.id,
            timestamp: now,
            reserve0,
            reserve1,
            tvl: snapshot.tvl,
            volume: snapshot.volume24h,
            price,
          });

          recordedCount++;
          this.logger.debug(`Recorded history for pool ${snapshot.poolAddress}`);
        } catch (error) {
          this.logger.error(`Failed to record history for pool ${pool.id}`, error);
          errorCount++;
        }
      }

      this.logger.log(
        `Pool history recording complete: ${recordedCount} recorded, ${errorCount} errors`,
      );

      return { recorded: recordedCount, errors: errorCount };
    } catch (error) {
      this.logger.error('Pool history recording failed', error);
      throw error;
    }
  }
}

