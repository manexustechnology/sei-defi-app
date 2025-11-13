import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { PoolRepositoryPort } from '../ports/pool-repository.port';
import { POOL_REPOSITORY } from '../ports/pool-repository.port';

type GetPoolHistoryInput = {
  poolId: string;
  from: Date;
  to: Date;
};

@Injectable()
export class GetPoolHistoryUseCase {
  constructor(
    @Inject(POOL_REPOSITORY)
    private readonly poolRepository: PoolRepositoryPort,
  ) {}

  async execute(input: GetPoolHistoryInput) {
    const pool = await this.poolRepository.findById(input.poolId);
    
    if (!pool) {
      throw new NotFoundException(`Pool with id ${input.poolId} not found`);
    }

    const historicalData = await this.poolRepository.getHistoricalData(
      input.poolId,
      input.from,
      input.to,
    );

    return historicalData.map((data) => ({
      timestamp: data.timestamp.toISOString(),
      reserve0: data.reserve0,
      reserve1: data.reserve1,
      tvl: data.tvl,
      volume: data.volume,
      price: data.price,
    }));
  }
}

