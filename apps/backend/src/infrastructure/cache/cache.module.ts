import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { ApplicationConfig } from '../../config/configuration';
import { ORDERS_CACHE } from '../../core/application/ports/orders-cache.port';
import { RedisOrdersCache } from './redis-orders-cache.service';
import { REDIS_CLIENT } from './tokens';

@Injectable()
class RedisCleanup implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onApplicationShutdown() {
    await this.client.quit();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ApplicationConfig>) => {
        const url = configService.get<string>('redis.url', { infer: true }) ?? 'redis://localhost:6379';
        return new Redis(url);
      },
    },
    {
      provide: ORDERS_CACHE,
      useClass: RedisOrdersCache,
    },
    RedisOrdersCache,
    RedisCleanup,
  ],
  exports: [ORDERS_CACHE, REDIS_CLIENT],
})
export class CacheModule {}
