import type { OrderSnapshot } from '../../domain/orders/order.entity';

export const ORDERS_CACHE = Symbol('ORDERS_CACHE');

export interface OrdersCachePort {
  get(): Promise<OrderSnapshot[] | null>;
  set(orders: OrderSnapshot[], ttlSeconds: number): Promise<void>;
  clear(): Promise<void>;
}
