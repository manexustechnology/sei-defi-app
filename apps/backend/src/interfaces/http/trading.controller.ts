import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PlaceOrderUseCase } from '../../core/application/use-cases/place-order.use-case';
import { GetOrdersUseCase } from '../../core/application/use-cases/get-orders.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { createApiResponseDto, createApiArrayResponseDto } from './dto/api-response.dto';
import { ResponseMessage } from './decorators/response-message.decorator';

// Create Swagger-compatible response DTOs
const OrderApiResponseDto = createApiResponseDto(OrderResponseDto);
const OrdersListApiResponseDto = createApiArrayResponseDto(OrderResponseDto);

@ApiTags('trading')
@Controller('trading/orders')
export class TradingController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Order created successfully')
  @ApiOperation({
    summary: 'Place a new order',
    description: 'Creates a new trading order with the specified asset pair, side, quantity, and price.',
  })
  @ApiCreatedResponse({
    description: 'The order has been successfully created.',
    type: OrderApiResponseDto,
  })
  create(@Body() dto: CreateOrderDto) {
    return this.placeOrderUseCase.execute(dto.toCommand());
  }

  @Get()
  @ResponseMessage('Orders retrieved successfully')
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieves all trading orders. Results are cached for improved performance.',
  })
  @ApiOkResponse({
    description: 'List of all orders.',
    type: OrdersListApiResponseDto,
  })
  findAll() {
    return this.getOrdersUseCase.execute();
  }
}
