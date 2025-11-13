import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import type { ApplicationConfig } from '../../config/configuration';
import type { EventBusPort } from '../../core/application/ports/event-bus.port';
import type { Order } from '../../core/domain/orders/order.entity';

@Injectable()
export class RabbitMqEventBus implements EventBusPort {
  private readonly logger = new Logger(RabbitMqEventBus.name);
  private readonly exchange: string;

  constructor(private readonly amqpConnection: AmqpConnection, configService: ConfigService<ApplicationConfig>) {
    this.exchange = configService.get<string>('rabbitmq.exchange', { infer: true }) ?? 'orders';
  }

  async publishOrderPlaced(order: Order): Promise<void> {
    const snapshot = order.snapshot();
    await this.amqpConnection.publish(this.exchange, 'orders.placed', snapshot);
    this.logger.debug(`Order published ${snapshot.id}`);
  }
}
