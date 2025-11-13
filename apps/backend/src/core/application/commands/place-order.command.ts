import { Inject, Injectable } from '@nestjs/common';
import { ResilienceCommand, ResilienceFactory } from 'nestjs-resilience';

import { EVENT_BUS, type EventBusPort } from '../ports/event-bus.port';
import { ORDER_REPOSITORY, type OrderRepositoryPort } from '../ports/order-repository.port';
import { ORDERS_CACHE, type OrdersCachePort } from '../ports/orders-cache.port';
import { Order } from '../../domain/orders/order.entity';
import type { OrderSide } from '../../domain/orders/order.side';
import type { OrderStatus } from '../../domain/orders/order.status';

export type PlaceOrderCommandInput = {
  assetPair: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status?: OrderStatus;
};

@Injectable()
export class PlaceOrderCommand extends ResilienceCommand {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepositoryPort,
    @Inject(EVENT_BUS) private readonly domainEventBus: EventBusPort,
    @Inject(ORDERS_CACHE) private readonly ordersCache: OrdersCachePort,
  ) {
    super([
      ResilienceFactory.createTimeoutStrategy(2000),
      ResilienceFactory.createRetryStrategy({ maxRetries: 2 }),
      ResilienceFactory.createCircuitBreakerStrategy({
        requestVolumeThreshold: 5,
        sleepWindowInMilliseconds: 15000,
        errorThresholdPercentage: 50,
      }),
    ]);
  }

  async run(input: PlaceOrderCommandInput) {
    const order = Order.create({
      assetPair: input.assetPair,
      side: input.side,
      quantity: input.quantity,
      price: input.price,
      status: input.status ?? 'pending',
    });

    const persisted = await this.orderRepository.save(order);
    await this.ordersCache.clear();
    await this.domainEventBus.publishOrderPlaced(persisted);

    return persisted.snapshot();
  }
}
