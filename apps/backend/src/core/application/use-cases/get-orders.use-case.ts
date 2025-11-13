import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { ApplicationConfig } from '../../../config/configuration';
import { ORDER_REPOSITORY, type OrderRepositoryPort } from '../ports/order-repository.port';
import { ORDERS_CACHE, type OrdersCachePort } from '../ports/orders-cache.port';

@Injectable()
export class GetOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repository: OrderRepositoryPort,
    @Inject(ORDERS_CACHE) private readonly cache: OrdersCachePort,
    private readonly configService: ConfigService<ApplicationConfig>,
  ) {}

  async execute() {
    const cached = await this.cache.get();
    if (cached) {
      return cached;
    }

    const orders = await this.repository.findAll();
    const snapshots = orders.map((order) => order.snapshot());

    const ttl = this.configService.get<number>('cache.ordersTtlSeconds', {
      infer: true,
    });

    await this.cache.set(snapshots, ttl ?? 30);

    return snapshots;
  }
}
