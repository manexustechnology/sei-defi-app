import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SyncPoolsUseCase } from '../../core/application/use-cases/sync-pools.use-case';
import { RecordPoolHistoryUseCase } from '../../core/application/use-cases/record-pool-history.use-case';
import { DragonSwapClient } from '../dex/dragonswap.client';
import { SailorClient } from '../dex/sailor.client';
import { PoolSyncService } from './pool-sync.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    DragonSwapClient,
    SailorClient,
    SyncPoolsUseCase,
    RecordPoolHistoryUseCase,
    PoolSyncService,
  ],
  exports: [PoolSyncService],
})
export class SchedulerModule {}

