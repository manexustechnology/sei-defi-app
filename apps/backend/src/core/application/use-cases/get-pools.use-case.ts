import { Inject, Injectable } from '@nestjs/common';

import type { PoolRepositoryPort } from '../ports/pool-repository.port';
import { POOL_REPOSITORY } from '../ports/pool-repository.port';
import type { PoolSnapshot } from '../../domain/pools/pool.entity';

type GetPoolsFilters = {
  dex?: string;
  isActive?: boolean;
};

@Injectable()
export class GetPoolsUseCase {
  constructor(
    @Inject(POOL_REPOSITORY)
    private readonly poolRepository: PoolRepositoryPort,
  ) {}

  async execute(filters?: GetPoolsFilters): Promise<PoolSnapshot[]> {
    const pools = await this.poolRepository.findAll(filters);
    return pools.map((pool) => pool.snapshot());
  }
}

