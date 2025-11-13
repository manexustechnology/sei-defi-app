import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PoolResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  poolAddress: string;

  @ApiProperty({ example: 'dragonswap', enum: ['dragonswap', 'sailor'] })
  dex: string;

  @ApiProperty({ example: '0xtoken0address...' })
  token0: string;

  @ApiProperty({ example: '0xtoken1address...' })
  token1: string;

  @ApiPropertyOptional({ example: 'SEI' })
  token0Symbol?: string;

  @ApiPropertyOptional({ example: 'USDC' })
  token1Symbol?: string;

  @ApiPropertyOptional({ example: '0.3%' })
  feeTier?: string;

  @ApiPropertyOptional({ example: '1250000.50' })
  tvl?: string;

  @ApiPropertyOptional({ example: '85000.25' })
  volume24h?: string;

  @ApiPropertyOptional({ example: '45.5' })
  apr?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: string;
}

export class PoolHistoricalDataDto {
  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '1000000.50' })
  reserve0: string;

  @ApiProperty({ example: '500000.25' })
  reserve1: string;

  @ApiPropertyOptional({ example: '1250000.75' })
  tvl?: string;

  @ApiPropertyOptional({ example: '25000.10' })
  volume?: string;

  @ApiPropertyOptional({ example: '2.0' })
  price?: string;
}

export class GetPoolsQueryDto {
  @ApiPropertyOptional({ example: 'dragonswap', enum: ['dragonswap', 'sailor'] })
  @IsOptional()
  @IsEnum(['dragonswap', 'sailor'])
  dex?: 'dragonswap' | 'sailor';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class GetHistoricalDataQueryDto {
  @ApiProperty({ 
    example: '2025-01-01T00:00:00.000Z',
    description: 'Start date for historical data (ISO 8601 format)'
  })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({ 
    example: '2025-01-31T23:59:59.999Z',
    description: 'End date for historical data (ISO 8601 format)'
  })
  @IsNotEmpty()
  @IsString()
  to: string;
}

