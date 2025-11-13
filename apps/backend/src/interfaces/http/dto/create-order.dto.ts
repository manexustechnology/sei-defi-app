import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsPositive, IsString, Matches } from 'class-validator';

import type { OrderSide } from '../../../core/domain/orders/order.side';

export enum OrderSideValue {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Asset pair in format BASE/QUOTE (e.g., BTC/USDT)',
    example: 'BTC/USDT',
    pattern: '^[A-Z]{2,5}/([A-Z]{2,5})$',
  })
  @IsString()
  @Matches(/^[A-Z]{2,5}\/([A-Z]{2,5})$/i, {
    message: 'assetPair must follow the format BASE/QUOTE',
  })
  assetPair!: string;

  @ApiProperty({
    description: 'Order side - BUY or SELL',
    enum: OrderSideValue,
    example: OrderSideValue.BUY,
  })
  @Transform(({ value }) => String(value).toUpperCase())
  @IsEnum(OrderSideValue)
  side!: OrderSideValue;

  @ApiProperty({
    description: 'Quantity of the order (must be positive)',
    example: 0.5,
    minimum: 0,
    exclusiveMinimum: true,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: 'Price of the order (must be positive)',
    example: 50000.0,
    minimum: 0,
    exclusiveMinimum: true,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  price!: number;

  toCommand(): { assetPair: string; side: OrderSide; quantity: number; price: number } {
    return {
      assetPair: this.assetPair.toUpperCase(),
      side: this.side as OrderSide,
      quantity: this.quantity,
      price: this.price,
    };
  }
}
