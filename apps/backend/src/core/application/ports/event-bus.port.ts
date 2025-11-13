import type { Order } from '../../domain/orders/order.entity';

export const EVENT_BUS = Symbol('EVENT_BUS');

export interface EventBusPort {
  publishOrderPlaced(order: Order): Promise<void>;
}
