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

@Injectable()
export class SailorClient {
  private readonly logger = new Logger(SailorClient.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Sailor Finance API base URL - can be configured via environment
    this.baseUrl =
      this.configService.get<string>('SAILOR_API_URL') ||
      'https://api.sailor.finance/v1'; // Example URL
  }

  async fetchPools(): Promise<SailorPoolData[]> {
    try {
      this.logger.log('Fetching pools from Sailor Finance...');

      const response = await fetch(`${this.baseUrl}/pools`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sailor Finance API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const pools = Array.isArray(data.pools) ? data.pools : data;

      this.logger.log(`Fetched ${pools.length} pools from Sailor Finance`);

      return pools.map((pool: any) => this.transformPool(pool));
    } catch (error) {
      this.logger.error('Failed to fetch pools from Sailor Finance', error);
      return [];
    }
  }

  async fetchPoolByAddress(address: string): Promise<SailorPoolData | null> {
    try {
      this.logger.log(`Fetching pool ${address} from Sailor Finance...`);

      const response = await fetch(`${this.baseUrl}/pools/${address}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Sailor Finance API error: ${response.status} ${response.statusText}`);
      }

      const pool = await response.json();
      return this.transformPool(pool);
    } catch (error) {
      this.logger.error(`Failed to fetch pool ${address} from Sailor Finance`, error);
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
        throw new Error(`Sailor Finance API error: ${response.status} ${response.statusText}`);
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

  private transformPool(pool: any): SailorPoolData {
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

