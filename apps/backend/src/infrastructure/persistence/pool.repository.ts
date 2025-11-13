import { Inject, Injectable } from '@nestjs/common';
import { and, between, desc, eq } from 'drizzle-orm';

import type { PoolRepositoryPort } from '../../core/application/ports/pool-repository.port';
import { Pool, type DexType } from '../../core/domain/pools/pool.entity';
import type { DrizzleDatabase } from './database.module';
import { poolHistoryTable, poolsTable, type PoolHistoryRecord, type PoolRecord } from './pool-schema';
import { DRIZZLE } from './tokens';

@Injectable()
export class PoolRepository implements PoolRepositoryPort {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async save(pool: Pool): Promise<Pool> {
    const snapshot = pool.snapshot();

    await this.db
      .insert(poolsTable)
      .values({
        id: snapshot.id,
        poolAddress: snapshot.poolAddress,
        dex: snapshot.dex,
        token0: snapshot.token0,
        token1: snapshot.token1,
        token0Symbol: snapshot.token0Symbol,
        token1Symbol: snapshot.token1Symbol,
        feeTier: snapshot.feeTier,
        tvl: snapshot.tvl,
        volume24h: snapshot.volume24h,
        apr: snapshot.apr,
        metadata: snapshot.metadata,
        isActive: snapshot.isActive ? 'true' : 'false',
        createdAt: new Date(snapshot.createdAt),
        updatedAt: new Date(snapshot.updatedAt),
      })
      .onConflictDoUpdate({
        target: poolsTable.poolAddress,
        set: {
          tvl: snapshot.tvl,
          volume24h: snapshot.volume24h,
          apr: snapshot.apr,
          metadata: snapshot.metadata,
          isActive: snapshot.isActive ? 'true' : 'false',
          updatedAt: new Date(snapshot.updatedAt),
        },
      });

    return pool;
  }

  async findByAddress(address: string): Promise<Pool | null> {
    const [record] = await this.db
      .select()
      .from(poolsTable)
      .where(eq(poolsTable.poolAddress, address))
      .limit(1);

    return record ? this.mapToDomain(record) : null;
  }

  async findAll(filters?: { dex?: string; isActive?: boolean }): Promise<Pool[]> {
    const conditions = [];
    if (filters?.dex) {
      conditions.push(eq(poolsTable.dex, filters.dex));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(poolsTable.isActive, filters.isActive ? 'true' : 'false'));
    }

    const query = this.db
      .select()
      .from(poolsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(poolsTable.tvl));

    const records = await query;
    return records.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Pool | null> {
    const [record] = await this.db
      .select()
      .from(poolsTable)
      .where(eq(poolsTable.id, id))
      .limit(1);

    return record ? this.mapToDomain(record) : null;
  }

  async saveHistoricalData(data: {
    poolId: string;
    timestamp: Date;
    reserve0: string;
    reserve1: string;
    tvl?: string;
    volume?: string;
    price?: string;
  }): Promise<void> {
    await this.db.insert(poolHistoryTable).values({
      poolId: data.poolId,
      timestamp: data.timestamp,
      reserve0: data.reserve0,
      reserve1: data.reserve1,
      tvl: data.tvl,
      volume: data.volume,
      price: data.price,
    });
  }

  async getHistoricalData(
    poolId: string,
    from: Date,
    to: Date,
  ): Promise<Array<{
    timestamp: Date;
    reserve0: string;
    reserve1: string;
    tvl?: string;
    volume?: string;
    price?: string;
  }>> {
    const records = await this.db
      .select()
      .from(poolHistoryTable)
      .where(
        and(
          eq(poolHistoryTable.poolId, poolId),
          between(poolHistoryTable.timestamp, from, to),
        ),
      )
      .orderBy(poolHistoryTable.timestamp);

    return records.map((record) => ({
      timestamp: record.timestamp,
      reserve0: record.reserve0 || '0',
      reserve1: record.reserve1 || '0',
      tvl: record.tvl || undefined,
      volume: record.volume || undefined,
      price: record.price || undefined,
    }));
  }

  private mapToDomain(record: PoolRecord): Pool {
    return Pool.rehydrate({
      id: record.id,
      poolAddress: record.poolAddress,
      dex: record.dex as DexType,
      token0: record.token0,
      token1: record.token1,
      token0Symbol: record.token0Symbol || undefined,
      token1Symbol: record.token1Symbol || undefined,
      feeTier: record.feeTier || undefined,
      tvl: record.tvl || undefined,
      volume24h: record.volume24h || undefined,
      apr: record.apr || undefined,
      metadata: (record.metadata as Record<string, unknown>) || undefined,
      isActive: record.isActive === 'true',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}

