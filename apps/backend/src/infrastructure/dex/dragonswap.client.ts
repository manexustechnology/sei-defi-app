import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type DragonSwapToken = {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
  usd_price?: number;
};

export type DragonSwapPoolData = {
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

type DragonSwapApiResponse = {
  status: string;
  tokens: Array<{
    address: string;
    name: string;
    symbol: string;
    usd_price: number;
    decimals: number;
  }>;
  pools: Array<{
    pool_address: string;
    token0_address: string;
    token1_address: string;
    first_token_reserve: number;
    second_token_reserve: number;
    liquidity: number;
    daily_volume: number;
    daily_fees: number;
    type: string;
    fee_tier: number;
    apr: number;
  }>;
};

/**
 * DragonSwap API Client
 *
 * Available endpoints:
 * - GET /api/v1/tokens - Fetch list of supported tokens
 * - GET /api/v1/pools - Fetch liquidity pools information
 * - GET /api/v1/pools/<poolId> - Fetch specific pool details
 * - GET /api/v1/quote - Request swap price quote
 * - GET /api/v1/routes - Get swap routes between tokens
 * - GET /api/v1/transactions - Fetch transaction history
 */
@Injectable()
export class DragonSwapClient {
  private readonly logger = new Logger(DragonSwapClient.name);
  private readonly baseUrl: string;
  private tokenMap: Map<string, DragonSwapToken> = new Map();

  constructor(private readonly configService: ConfigService) {
    // DragonSwap API base URL from environment or default
    this.baseUrl =
      this.configService.get<string>('DRAGONSWAP_API_URL') ||
      'https://sei-api.dragonswap.app/api/v1';

    this.logger.log(`DragonSwap API URL: ${this.baseUrl}`);
  }

  /**
   * Fetch list of supported tokens from DragonSwap
   * This also builds a token map for quick lookups when processing pools
   */
  async fetchTokens(): Promise<DragonSwapToken[]> {
    try {
      this.logger.log('Fetching tokens from DragonSwap...');

      const response = await fetch(`${this.baseUrl}/pools`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`DragonSwap API error: ${response.status} ${response.statusText}`);
      }

      const data: DragonSwapApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        this.logger.warn(`DragonSwap API returned status: ${data.status}`);
      }

      const tokens = data.tokens || [];
      this.logger.log(`✅ Fetched ${tokens.length} tokens from DragonSwap`);

      // Build token map for quick lookups
      this.tokenMap.clear();
      const transformedTokens = tokens.map((token) => {
        const transformed: DragonSwapToken = {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          name: token.name,
          usd_price: token.usd_price,
        };
        this.tokenMap.set(token.address.toLowerCase(), transformed);
        return transformed;
      });

      return transformedTokens;
    } catch (error) {
      this.logger.error('Failed to fetch tokens from DragonSwap', error);
      return [];
    }
  }

  /**
   * Fetch all liquidity pools from DragonSwap
   * The main endpoint returns both tokens and pools in one response
   */
  async fetchPools(): Promise<DragonSwapPoolData[]> {
    try {
      this.logger.log('📡 Fetching pools from DragonSwap...');

      const response = await fetch(`${this.baseUrl}/pools`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `DragonSwap API error: ${response.status} ${response.statusText}`
        );
      }

      const data: DragonSwapApiResponse = await response.json();

      if (data.status !== 'ok') {
        this.logger.warn(`DragonSwap API returned status: ${data.status}`);
        return [];
      }

      // First, build token map if not already done
      if (this.tokenMap.size === 0 && data.tokens) {
        this.logger.log('Building token map from response...');
        data.tokens.forEach((token) => {
          this.tokenMap.set(token.address.toLowerCase(), {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            name: token.name,
            usd_price: token.usd_price,
          });
        });
      }

      const pools = data.pools || [];
      this.logger.log(`✅ Fetched ${pools.length} pools from DragonSwap`);

      return pools
        .map((pool: any) => {
          try {
            return this.transformPool(pool);
          } catch (err) {
            this.logger.warn(
              `Failed to transform pool ${pool?.pool_address || 'unknown'}`,
              err
            );
            return null;
          }
        })
        .filter(
          (pool: DragonSwapPoolData | null): pool is DragonSwapPoolData =>
            pool !== null
        );
    } catch (error) {
      this.logger.error('❌ Failed to fetch pools from DragonSwap', error);
      // Return empty array on error to allow other sources to work
      return [];
    }
  }

  /**
   * Fetch specific pool by address/ID from DragonSwap
   * Endpoint: GET /api/v1/pools/<poolId>
   */
  async fetchPoolByAddress(poolId: string): Promise<DragonSwapPoolData | null> {
    try {
      this.logger.log(`Fetching pool ${poolId} from DragonSwap...`);

      const response = await fetch(`${this.baseUrl}/pools/${poolId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`Pool ${poolId} not found on DragonSwap`);
          return null;
        }
        throw new Error(
          `DragonSwap API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const pool = data.pool || data.data || data;

      return this.transformPool(pool);
    } catch (error) {
      this.logger.error(`Failed to fetch pool ${poolId} from DragonSwap`, error);
      return null;
    }
  }

  /**
   * Fetch historical data for a specific pool
   * Note: This endpoint may not be available in the DragonSwap API.
   * If it returns 404, we fall back to using the transactions endpoint or return empty.
   *
   * Possible endpoints:
   * - GET /api/v1/pools/<poolId>/history?from=<ISO>&to=<ISO>
   * - GET /api/v1/transactions?pool=<poolId>&from=<ISO>&to=<ISO>
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

      // Try the history endpoint first
      let response = await fetch(
        `${this.baseUrl}/pools/${poolId}/history?from=${from.toISOString()}&to=${to.toISOString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000),
        },
      );

      // If history endpoint doesn't exist, try transactions endpoint
      if (response.status === 404) {
        this.logger.warn(
          `History endpoint not available for pool ${poolId}, trying transactions endpoint...`
        );

        response = await fetch(
          `${this.baseUrl}/transactions?pool=${poolId}&from=${from.toISOString()}&to=${to.toISOString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(30000),
          },
        );
      }

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(
            `Historical data not available for pool ${poolId} on DragonSwap`
          );
          return [];
        }
        throw new Error(
          `DragonSwap API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const history = Array.isArray(data)
        ? data
        : data.history || data.data || data.transactions || [];

      this.logger.log(`Fetched ${history.length} historical points for pool ${poolId}`);

      return history
        .map((point: any) => {
          try {
            return {
              timestamp: new Date(
                point.timestamp || point.time || point.createdAt
              ),
              reserve0: point.reserve0 || point.token0Reserve || '0',
              reserve1: point.reserve1 || point.token1Reserve || '0',
              tvlUSD: point.tvlUSD || point.tvl,
              volumeUSD: point.volumeUSD || point.volume,
              price: point.price || point.token0Price,
            };
          } catch (err) {
            this.logger.warn(`Failed to parse history point`, err);
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
   * Transform DragonSwap API response to our standard pool format
   * Real API structure:
   * {
   *   pool_address: string,
   *   token0_address: string,
   *   token1_address: string,
   *   first_token_reserve: number,
   *   second_token_reserve: number,
   *   liquidity: number,
   *   daily_volume: number,
   *   fee_tier: number,
   *   apr: number
   * }
   */
  private transformPool(pool: any): DragonSwapPoolData {
    if (!pool) {
      throw new Error('Pool data is null or undefined');
    }

    const address = pool.pool_address;
    if (!address) {
      throw new Error('Pool address is required');
    }

    // Get token info from token map
    const token0Address = pool.token0_address?.toLowerCase();
    const token1Address = pool.token1_address?.toLowerCase();
    
    const token0Info = token0Address ? this.tokenMap.get(token0Address) : null;
    const token1Info = token1Address ? this.tokenMap.get(token1Address) : null;

    return {
      address,
      token0: {
        address: pool.token0_address,
        symbol: token0Info?.symbol || 'UNKNOWN',
        decimals: token0Info?.decimals || 18,
      },
      token1: {
        address: pool.token1_address,
        symbol: token1Info?.symbol || 'UNKNOWN',
        decimals: token1Info?.decimals || 18,
      },
      reserve0: String(pool.first_token_reserve || 0),
      reserve1: String(pool.second_token_reserve || 0),
      totalSupply: String(pool.liquidity || 0),
      feeTier: String(pool.fee_tier || 0.3),
      volumeUSD24h: String(pool.daily_volume || 0),
      tvlUSD: String(pool.liquidity || 0), // liquidity is TVL in USD
      apr: String(pool.apr || 0),
    };
  }
}


