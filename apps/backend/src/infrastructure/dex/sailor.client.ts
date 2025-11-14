import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SailorPoolData = {
  address: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  feeTier?: string;
  volumeUSD24h?: string;
  tvlUSD?: string;
  apr?: string;
};

export type SailorMarketSnapshot = {
  base_id: string;
  base_name: string;
  base_symbol: string;
  quote_id: string;
  quote_name: string;
  quote_symbol: string;
  last_price: string;
  base_volume: string;
  quote_volume: string;
};

/**
 * Sailor Finance API Client
 *
 * Base URL: https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_otherapi
 *
 * Available endpoints:
 * - GET /cmc/c1 - Market snapshots (tickers, 24h volumes)
 * - GET /cmc/c3 - Aggregated listings feed
 * - POST /sailor/subgraph - GraphQL endpoint for pools, tokens, swaps
 *
 * Factory Contract: 0xA51136931fdd3875902618bF6B3abe38Ab2D703b
 * Rate limit: ~10 requests/second per IP
 */
@Injectable()
export class SailorClient {
  private readonly logger = new Logger(SailorClient.name);
  private readonly baseUrl: string;
  private readonly factoryAddress = '0xA51136931fdd3875902618bF6B3abe38Ab2D703b';

  constructor(private readonly configService: ConfigService) {
    // Sailor Finance API base URL from environment or default
    this.baseUrl =
      this.configService.get<string>('SAILOR_API_URL') ||
      'https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_otherapi';

    this.logger.log(`Sailor Finance API URL: ${this.baseUrl}`);
  }

  /**
   * Fetch market snapshots from Sailor Finance
   * Endpoint: GET /cmc/c1
   */
  async fetchMarketSnapshots(): Promise<Record<string, SailorMarketSnapshot>> {
    try {
      this.logger.log('Fetching market snapshots from Sailor Finance...');

      const response = await fetch(`${this.baseUrl}/cmc/c1`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `Sailor Finance API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      this.logger.log(`Fetched ${Object.keys(data).length} market pairs from Sailor Finance`);

      return data;
    } catch (error) {
      this.logger.error('Failed to fetch market snapshots from Sailor Finance', error);
      return {};
    }
  }

  /**
   * Fetch all liquidity pools from Sailor Finance using GraphQL
   * Endpoint: POST /sailor/subgraph
   */
  async fetchPools(): Promise<SailorPoolData[]> {
    try {
      this.logger.log('Fetching pools from Sailor Finance via GraphQL...');

      const query = `
        {
          pools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
            id
            feeTier
            totalValueLockedUSD
            volumeUSD
            token0 {
              id
              symbol
              decimals
              name
            }
            token1 {
              id
              symbol
              decimals
              name
            }
          }
        }
      `;

      const response = await fetch(`${this.baseUrl}/sailor/subgraph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `Sailor Finance API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      // API response is wrapped: { success: true, data: { data: { pools: [...] } } }
      const pools = result?.data?.data?.pools || result?.data?.pools || [];

      this.logger.log(`✅ Fetched ${pools.length} pools from Sailor Finance`);

      return pools
        .map((pool: any) => {
          try {
            return this.transformPool(pool);
          } catch (err) {
            this.logger.warn(
              `Failed to transform pool ${pool?.id || 'unknown'}`,
              err
            );
            return null;
          }
        })
        .filter(
          (pool: SailorPoolData | null): pool is SailorPoolData => pool !== null
        );
    } catch (error) {
      this.logger.error('Failed to fetch pools from Sailor Finance', error);
      return [];
    }
  }

  /**
   * Fetch specific pool by ID from Sailor Finance using GraphQL
   * Endpoint: POST /sailor/subgraph
   */
  async fetchPoolByAddress(poolId: string): Promise<SailorPoolData | null> {
    try {
      this.logger.log(`Fetching pool ${poolId} from Sailor Finance...`);

      const query = `
        {
          pool(id: "${poolId.toLowerCase()}") {
            id
            feeTier
            totalValueLockedUSD
            volumeUSD
            token0 {
              id
              symbol
              decimals
              name
            }
            token1 {
              id
              symbol
              decimals
              name
            }
          }
        }
      `;

      const response = await fetch(`${this.baseUrl}/sailor/subgraph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(
          `Sailor Finance API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      // API response is wrapped: { success: true, data: { data: { pool: {...} } } }
      const pool = result?.data?.data?.pool || result?.data?.pool;

      if (!pool) {
        this.logger.warn(`Pool ${poolId} not found on Sailor Finance`);
        return null;
      }

      return this.transformPool(pool);
    } catch (error) {
      this.logger.error(`Failed to fetch pool ${poolId} from Sailor Finance`, error);
      return null;
    }
  }

  /**
   * Fetch historical swap data for a specific pool using GraphQL
   * Endpoint: POST /sailor/subgraph
   *
   * Note: Uses swaps as a proxy for historical data since pool snapshots
   * may not be directly available in the subgraph
   */
  async fetchPoolHistory(
    poolId: string,
    from: Date,
    to: Date,
  ): Promise<
    Array<{
      timestamp: Date;
      reserve0: string;
      reserve1: string;
      tvlUSD?: string;
      volumeUSD?: string;
      price?: string;
    }>
  > {
    try {
      this.logger.log(`Fetching historical data for pool ${poolId}...`);

      const fromTimestamp = Math.floor(from.getTime() / 1000);
      const toTimestamp = Math.floor(to.getTime() / 1000);

      const query = `
        {
          swaps(
            first: 1000,
            orderBy: timestamp,
            orderDirection: asc,
            where: {
              pool: "${poolId.toLowerCase()}",
              timestamp_gte: ${fromTimestamp},
              timestamp_lte: ${toTimestamp}
            }
          ) {
            id
            timestamp
            amount0
            amount1
            sqrtPriceX96
            tick
            pool {
              id
              totalValueLockedUSD
            }
          }
        }
      `;

      const response = await fetch(`${this.baseUrl}/sailor/subgraph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `Sailor Finance API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      // API response is wrapped: { success: true, data: { data: { swaps: [...] } } }
      const swaps = result?.data?.data?.swaps || result?.data?.swaps || [];

      this.logger.log(
        `✅ Fetched ${swaps.length} historical swap points for pool ${poolId}`
      );

      return swaps
        .map((swap: any) => {
          try {
            return {
              timestamp: new Date(Number(swap.timestamp) * 1000),
              reserve0: swap.amount0 || '0',
              reserve1: swap.amount1 || '0',
              tvlUSD: swap.pool?.totalValueLockedUSD,
              volumeUSD: undefined, // Would need to aggregate
              price: swap.sqrtPriceX96
                ? this.calculatePriceFromSqrtX96(swap.sqrtPriceX96)
                : undefined,
            };
          } catch (err) {
            this.logger.warn(`Failed to parse swap point`, err);
            return null;
          }
        })
        .filter(
          (
            point: {
              timestamp: Date;
              reserve0: string;
              reserve1: string;
              tvlUSD?: string;
              volumeUSD?: string;
              price?: string;
            } | null
          ): point is {
            timestamp: Date;
            reserve0: string;
            reserve1: string;
            tvlUSD?: string;
            volumeUSD?: string;
            price?: string;
          } => point !== null
        );
    } catch (error) {
      this.logger.error(`Failed to fetch history for pool ${poolId}`, error);
      return [];
    }
  }

  /**
   * Transform Sailor Finance GraphQL pool data to our standard format
   */
  private transformPool(pool: any): SailorPoolData {
    if (!pool || !pool.id) {
      throw new Error('Pool data is invalid or missing id');
    }

    return {
      address: pool.id,
      token0: {
        address: pool.token0?.id || '',
        symbol: pool.token0?.symbol || 'UNKNOWN',
        decimals: Number(pool.token0?.decimals) || 18,
      },
      token1: {
        address: pool.token1?.id || '',
        symbol: pool.token1?.symbol || 'UNKNOWN',
        decimals: Number(pool.token1?.decimals) || 18,
      },
      reserve0: '0', // Not directly available in GraphQL response
      reserve1: '0', // Not directly available in GraphQL response
      totalSupply: pool.liquidity || '0',
      feeTier: pool.feeTier ? `${Number(pool.feeTier) / 10000}%` : undefined,
      volumeUSD24h: pool.volumeUSD,
      tvlUSD: pool.totalValueLockedUSD,
      apr: undefined, // Would need to be calculated
    };
  }

  /**
   * Calculate price from Uniswap V3 sqrtPriceX96
   * price = (sqrtPriceX96 / 2^96)^2
   */
  private calculatePriceFromSqrtX96(sqrtPriceX96: string): string {
    try {
      const Q96 = BigInt(2) ** BigInt(96);
      const sqrtPrice = BigInt(sqrtPriceX96);
      const price = (sqrtPrice * sqrtPrice) / Q96 / Q96;
      return price.toString();
    } catch (error) {
      this.logger.warn('Failed to calculate price from sqrtPriceX96', error);
      return '0';
    }
  }
}


