import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class DragonSwapClient {
  private readonly logger = new Logger(DragonSwapClient.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // DragonSwap API base URL - can be configured via environment
    this.baseUrl =
      this.configService.get<string>('DRAGONSWAP_API_URL') ||
      'https://api.dragonswap.app/v1'; // Example URL
  }

  async fetchPools(): Promise<DragonSwapPoolData[]> {
    try {
      this.logger.log('Fetching pools from DragonSwap...');

      // Example API call - adjust based on actual DragonSwap API
      const response = await fetch(`${this.baseUrl}/pools`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DragonSwap API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the response to match our expected format
      // This structure should be adjusted based on actual API response
      const pools = Array.isArray(data.pools) ? data.pools : data;

      this.logger.log(`Fetched ${pools.length} pools from DragonSwap`);

      return pools.map((pool: any) => this.transformPool(pool));
    } catch (error) {
      this.logger.error('Failed to fetch pools from DragonSwap', error);
      // Return empty array on error to allow other sources to work
      return [];
    }
  }

  async fetchPoolByAddress(address: string): Promise<DragonSwapPoolData | null> {
    try {
      this.logger.log(`Fetching pool ${address} from DragonSwap...`);

      const response = await fetch(`${this.baseUrl}/pools/${address}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`DragonSwap API error: ${response.status} ${response.statusText}`);
      }

      const pool = await response.json();
      return this.transformPool(pool);
    } catch (error) {
      this.logger.error(`Failed to fetch pool ${address} from DragonSwap`, error);
      return null;
    }
  }

  async fetchPoolHistory(
    address: string,
    from: Date,
    to: Date,
  ): Promise<Array<{
    timestamp: Date;
    reserve0: string;
    reserve1: string;
    tvlUSD?: string;
    volumeUSD?: string;
    price?: string;
  }>> {
    try {
      this.logger.log(`Fetching historical data for pool ${address}...`);

      const response = await fetch(
        `${this.baseUrl}/pools/${address}/history?from=${from.toISOString()}&to=${to.toISOString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`DragonSwap API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const history = Array.isArray(data.history) ? data.history : data;

      return history.map((point: any) => ({
        timestamp: new Date(point.timestamp),
        reserve0: point.reserve0 || point.token0Reserve || '0',
        reserve1: point.reserve1 || point.token1Reserve || '0',
        tvlUSD: point.tvlUSD || point.tvl,
        volumeUSD: point.volumeUSD || point.volume,
        price: point.price || point.token0Price,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch history for pool ${address}`, error);
      return [];
    }
  }

  private transformPool(pool: any): DragonSwapPoolData {
    // Transform API response to our standard format
    // Adjust field mappings based on actual DragonSwap API response
    return {
      address: pool.address || pool.id || pool.poolAddress,
      token0: {
        address: pool.token0?.address || pool.token0Address || pool.baseToken,
        symbol: pool.token0?.symbol || pool.token0Symbol || 'UNKNOWN',
        decimals: pool.token0?.decimals || 18,
      },
      token1: {
        address: pool.token1?.address || pool.token1Address || pool.quoteToken,
        symbol: pool.token1?.symbol || pool.token1Symbol || 'UNKNOWN',
        decimals: pool.token1?.decimals || 18,
      },
      reserve0: pool.reserve0 || pool.token0Reserve || '0',
      reserve1: pool.reserve1 || pool.token1Reserve || '0',
      totalSupply: pool.totalSupply || pool.liquidity || '0',
      feeTier: pool.feeTier || pool.fee || '0.3%',
      volumeUSD24h: pool.volumeUSD24h || pool.volume24h || pool.dailyVolumeUSD,
      tvlUSD: pool.tvlUSD || pool.tvl || pool.liquidityUSD,
      apr: pool.apr || pool.apy,
    };
  }
}

