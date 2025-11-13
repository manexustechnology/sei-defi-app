import { Module } from '@nestjs/common';

import { GetPoolsUseCase } from '../../core/application/use-cases/get-pools.use-case';
import { GetPoolHistoryUseCase } from '../../core/application/use-cases/get-pool-history.use-case';
import { PoolsController } from './pools.controller';

@Module({
  controllers: [PoolsController],
  providers: [GetPoolsUseCase, GetPoolHistoryUseCase],
})
export class PoolsModule {}

