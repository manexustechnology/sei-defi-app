import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatusValue {
  PENDING = 'pending',
  OPEN = 'open',
  FILLED = 'filled',
}

export enum OrderSideValue {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Asset pair in format BASE/QUOTE',
    example: 'BTC/USDT',
  })
  assetPair!: string;

  @ApiProperty({
    description: 'Order side (BUY or SELL)',
    enum: OrderSideValue,
    example: OrderSideValue.BUY,
  })
  side!: OrderSideValue;

  @ApiProperty({
    description: 'Quantity of the order',
    example: 0.5,
    minimum: 0,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Price of the order',
    example: 50000.0,
    minimum: 0,
  })
  price!: number;

  @ApiProperty({
    description: 'Status of the order',
    enum: OrderStatusValue,
    example: OrderStatusValue.PENDING,
  })
  status!: OrderStatusValue;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the order was created',
    example: '2025-11-13T23:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the order was last updated',
    example: '2025-11-13T23:00:00.000Z',
  })
  updatedAt!: string;
}

