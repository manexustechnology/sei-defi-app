import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

import type { OrdersCachePort } from '../../core/application/ports/orders-cache.port';
import type { OrderSnapshot } from '../../core/domain/orders/order.entity';
import { REDIS_CLIENT } from './tokens';

@Injectable()
export class RedisOrdersCache implements OrdersCachePort {
  private readonly cacheKey = 'orders:all';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(): Promise<OrderSnapshot[] | null> {
    const cached = await this.redis.get(this.cacheKey);
    return cached ? (JSON.parse(cached) as OrderSnapshot[]) : null;
  }

  async set(orders: OrderSnapshot[], ttlSeconds: number): Promise<void> {
    await this.redis.set(this.cacheKey, JSON.stringify(orders), 'EX', ttlSeconds);
  }

  async clear(): Promise<void> {
    await this.redis.del(this.cacheKey);
  }
}
