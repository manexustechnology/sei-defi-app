import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResilienceModule } from 'nestjs-resilience';

import configuration from '../config/configuration';
import { validateEnvironment } from '../config/validation';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { MessagingModule } from '../infrastructure/messaging/messaging.module';
import { DatabaseModule } from '../infrastructure/persistence/database.module';
import { SchedulerModule } from '../infrastructure/scheduler/scheduler.module';
import { TradingHttpModule } from '../interfaces/http/trading.module';
import { PoolsModule } from '../interfaces/http/pools.module';
import { AdminModule } from '../interfaces/http/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    ResilienceModule.forRoot({}),
    DatabaseModule,
    CacheModule,
    MessagingModule,
    SchedulerModule,
    TradingHttpModule,
    PoolsModule,
    AdminModule,
  ],
})
export class AppModule {}
