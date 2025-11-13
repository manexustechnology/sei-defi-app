import { Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import configuration from '../../config/configuration';
import { EVENT_BUS } from '../../core/application/ports/event-bus.port';
import { RabbitMqEventBus } from './rabbitmq.event-bus';

const appConfig = configuration();

@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: appConfig.rabbitmq.url,
      exchanges: [{ name: appConfig.rabbitmq.exchange, type: 'topic' }],
      connectionInitOptions: { wait: true, timeout: 10000 },
    }),
  ],
  providers: [
    {
      provide: EVENT_BUS,
      useClass: RabbitMqEventBus,
    },
    RabbitMqEventBus,
  ],
  exports: [EVENT_BUS],
})
export class MessagingModule {}
