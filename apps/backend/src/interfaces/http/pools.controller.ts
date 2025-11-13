import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { GetPoolsUseCase } from '../../core/application/use-cases/get-pools.use-case';
import { GetPoolHistoryUseCase } from '../../core/application/use-cases/get-pool-history.use-case';
import { 
  PoolResponseDto, 
  PoolHistoricalDataDto,
  GetPoolsQueryDto,
  GetHistoricalDataQueryDto,
} from './dto/pool.dto';
import { createApiResponseDto, createApiArrayResponseDto } from './dto/api-response.dto';
import { ResponseMessage } from './decorators/response-message.decorator';

const PoolApiResponseDto = createApiResponseDto(PoolResponseDto);
const PoolsListApiResponseDto = createApiArrayResponseDto(PoolResponseDto);
const HistoricalDataApiResponseDto = createApiArrayResponseDto(PoolHistoricalDataDto);

@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(
    private readonly getPoolsUseCase: GetPoolsUseCase,
    private readonly getPoolHistoryUseCase: GetPoolHistoryUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Pools retrieved successfully')
  @ApiOperation({
    summary: 'Get all liquidity pools',
    description: 'Retrieves all liquidity pools from DragonSwap and Sailor Finance. Can filter by DEX and active status.',
  })
  @ApiOkResponse({
    description: 'List of all pools.',
    type: PoolsListApiResponseDto,
  })
  async findAll(@Query() query: GetPoolsQueryDto) {
    return this.getPoolsUseCase.execute({
      dex: query.dex,
      isActive: query.isActive,
    });
  }

  @Get(':poolId/history')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Pool historical data retrieved successfully')
  @ApiOperation({
    summary: 'Get pool historical data',
    description: 'Retrieves historical balance and price data for a specific pool within a date range.',
  })
  @ApiParam({
    name: 'poolId',
    description: 'Pool ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Historical data for the pool.',
    type: HistoricalDataApiResponseDto,
  })
  async getHistory(
    @Param('poolId') poolId: string,
    @Query() query: GetHistoricalDataQueryDto,
  ) {
    return this.getPoolHistoryUseCase.execute({
      poolId,
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }
}

