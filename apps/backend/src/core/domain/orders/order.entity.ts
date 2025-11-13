import { randomUUID } from 'crypto';

import { OrderStatus } from './order.status';
import { OrderSide } from './order.side';

export type OrderSnapshot = {
  id: string;
  assetPair: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

type OrderProps = {
  id: string;
  assetPair: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(input: Omit<OrderProps, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const now = new Date();
    return new Order({
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: OrderProps): Order {
    return new Order(props);
  }

  markAs(status: OrderStatus): Order {
    return new Order({ ...this.props, status, updatedAt: new Date() });
  }

  snapshot(): OrderSnapshot {
    return {
      id: this.props.id,
      assetPair: this.props.assetPair,
      side: this.props.side,
      quantity: this.props.quantity,
      price: this.props.price,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get assetPair(): string {
    return this.props.assetPair;
  }

  get side(): OrderSide {
    return this.props.side;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): number {
    return this.props.price;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
