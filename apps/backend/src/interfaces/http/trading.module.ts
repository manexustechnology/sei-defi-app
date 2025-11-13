import { Module } from '@nestjs/common';

import { PlaceOrderCommand } from '../../core/application/commands/place-order.command';
import { GetOrdersUseCase } from '../../core/application/use-cases/get-orders.use-case';
import { PlaceOrderUseCase } from '../../core/application/use-cases/place-order.use-case';
import { TradingController } from './trading.controller';

@Module({
  controllers: [TradingController],
  providers: [PlaceOrderCommand, PlaceOrderUseCase, GetOrdersUseCase],
})
export class TradingHttpModule {}
