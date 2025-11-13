import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SyncPoolsUseCase } from '../../core/application/use-cases/sync-pools.use-case';
import { RecordPoolHistoryUseCase } from '../../core/application/use-cases/record-pool-history.use-case';

@Injectable()
export class PoolSyncService implements OnModuleInit {
  private readonly logger = new Logger(PoolSyncService.name);
  private readonly syncEnabled: boolean;

  constructor(
    private readonly syncPoolsUseCase: SyncPoolsUseCase,
    private readonly recordPoolHistoryUseCase: RecordPoolHistoryUseCase,
    private readonly configService: ConfigService,
  ) {
    this.syncEnabled = this.configService.get<boolean>('ENABLE_POOL_SYNC', true);
  }

  async onModuleInit() {
    if (this.syncEnabled) {
      this.logger.log('Pool synchronization enabled - running initial sync...');
      // Run initial sync on startup
      await this.syncPools();
    } else {
      this.logger.warn('Pool synchronization is disabled');
    }
  }

  /**
   * Sync pools every 5 minutes
   * Fetches latest pool data from DragonSwap and Sailor Finance
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'syncPools',
  })
  async syncPools() {
    if (!this.syncEnabled) {
      return;
    }

    try {
      this.logger.log('🔄 Starting scheduled pool sync...');
      const result = await this.syncPoolsUseCase.execute();
      this.logger.log(
        `✅ Pool sync completed: ${result.synced} synced, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error('❌ Pool sync failed:', error);
    }
  }

  /**
   * Record historical snapshots every 15 minutes
   * Captures pool state for time-series analysis
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'recordPoolHistory',
  })
  async recordPoolHistory() {
    if (!this.syncEnabled) {
      return;
    }

    try {
      this.logger.log('📊 Recording pool historical snapshots...');
      const result = await this.recordPoolHistoryUseCase.execute();
      this.logger.log(
        `✅ History recording completed: ${result.recorded} recorded, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error('❌ History recording failed:', error);
    }
  }

  /**
   * Manual trigger for pool sync (useful for testing or admin endpoints)
   */
  async triggerSync(): Promise<{ synced: number; errors: number }> {
    this.logger.log('🔄 Manual pool sync triggered');
    return await this.syncPoolsUseCase.execute();
  }

  /**
   * Manual trigger for history recording
   */
  async triggerHistoryRecording(): Promise<{ recorded: number; errors: number }> {
    this.logger.log('📊 Manual history recording triggered');
    return await this.recordPoolHistoryUseCase.execute();
  }
}

