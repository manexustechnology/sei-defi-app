import { Injectable } from '@nestjs/common';

import { PlaceOrderCommand, type PlaceOrderCommandInput } from '../commands/place-order.command';

@Injectable()
export class PlaceOrderUseCase {
  constructor(private readonly command: PlaceOrderCommand) {}

  execute(input: PlaceOrderCommandInput) {
    return this.command.execute(input);
  }
}
