import type { Order } from '../../domain/orders/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepositoryPort {
  save(order: Order): Promise<Order>;
  findAll(): Promise<Order[]>;
}
