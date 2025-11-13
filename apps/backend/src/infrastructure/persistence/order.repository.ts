import { Inject, Injectable } from '@nestjs/common';
import { desc } from 'drizzle-orm';

import type { OrderRepositoryPort } from '../../core/application/ports/order-repository.port';
import { Order } from '../../core/domain/orders/order.entity';
import type { OrderSide } from '../../core/domain/orders/order.side';
import type { OrderStatus } from '../../core/domain/orders/order.status';
import type { DrizzleDatabase } from './database.module';
import { ordersTable, type OrderRecord } from './schema';
import { DRIZZLE } from './tokens';

@Injectable()
export class OrderRepository implements OrderRepositoryPort {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async save(order: Order): Promise<Order> {
    const snapshot = order.snapshot();

    await this.db
      .insert(ordersTable)
      .values({
        id: snapshot.id,
        assetPair: snapshot.assetPair,
        side: snapshot.side,
        quantity: snapshot.quantity.toString(),
        price: snapshot.price.toString(),
        status: snapshot.status,
        createdAt: new Date(snapshot.createdAt),
        updatedAt: new Date(snapshot.updatedAt),
      })
      .onConflictDoUpdate({
        target: ordersTable.id,
        set: {
          status: snapshot.status,
          updatedAt: new Date(snapshot.updatedAt),
        },
      });

    return order;
  }

  async findAll(): Promise<Order[]> {
    const records = await this.db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    return records.map(this.mapToDomain);
  }

  private mapToDomain(record: OrderRecord): Order {
    return Order.rehydrate({
      id: record.id,
      assetPair: record.assetPair,
      side: record.side as OrderSide,
      quantity: Number(record.quantity),
      price: Number(record.price),
      status: record.status as OrderStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
