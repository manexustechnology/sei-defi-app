import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { ApplicationConfig } from '../../config/configuration';
import { ORDER_REPOSITORY } from '../../core/application/ports/order-repository.port';
import { POOL_REPOSITORY } from '../../core/application/ports/pool-repository.port';
import { OrderRepository } from './order.repository';
import { PoolRepository } from './pool.repository';
import * as schema from './schema';
import { DRIZZLE, PG_POOL } from './tokens';

@Injectable()
class PoolCleanup implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ApplicationConfig>) => {
        const url = configService.get<string>('database.url', { infer: true });
        return new Pool({ connectionString: url });
      },
    },
    {
      provide: DRIZZLE,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    {
      provide: POOL_REPOSITORY,
      useClass: PoolRepository,
    },
    OrderRepository,
    PoolRepository,
    PoolCleanup,
  ],
  exports: [ORDER_REPOSITORY, POOL_REPOSITORY, DRIZZLE, PG_POOL],
})
export class DatabaseModule {}

export type DrizzleDatabase = NodePgDatabase<typeof schema>;
