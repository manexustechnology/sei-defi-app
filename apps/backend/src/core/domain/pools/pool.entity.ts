import { randomUUID } from 'crypto';

export type DexType = 'dragonswap' | 'sailor';

export type PoolSnapshot = {
  id: string;
  poolAddress: string;
  dex: DexType;
  token0: string;
  token1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  feeTier?: string;
  tvl?: string;
  volume24h?: string;
  apr?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PoolProps = {
  id: string;
  poolAddress: string;
  dex: DexType;
  token0: string;
  token1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  feeTier?: string;
  tvl?: string;
  volume24h?: string;
  apr?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Pool {
  private constructor(private readonly props: PoolProps) {}

  static create(input: Omit<PoolProps, 'id' | 'createdAt' | 'updatedAt'>): Pool {
    const now = new Date();
    return new Pool({
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: PoolProps): Pool {
    return new Pool(props);
  }

  updateMetrics(tvl?: string, volume24h?: string, apr?: string): Pool {
    return new Pool({
      ...this.props,
      tvl,
      volume24h,
      apr,
      updatedAt: new Date(),
    });
  }

  deactivate(): Pool {
    return new Pool({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  snapshot(): PoolSnapshot {
    return {
      id: this.props.id,
      poolAddress: this.props.poolAddress,
      dex: this.props.dex,
      token0: this.props.token0,
      token1: this.props.token1,
      token0Symbol: this.props.token0Symbol,
      token1Symbol: this.props.token1Symbol,
      feeTier: this.props.feeTier,
      tvl: this.props.tvl,
      volume24h: this.props.volume24h,
      apr: this.props.apr,
      metadata: this.props.metadata,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get poolAddress(): string {
    return this.props.poolAddress;
  }

  get dex(): DexType {
    return this.props.dex;
  }

  get token0(): string {
    return this.props.token0;
  }

  get token1(): string {
    return this.props.token1;
  }

  get pairName(): string {
    const symbol0 = this.props.token0Symbol || this.props.token0.slice(0, 6);
    const symbol1 = this.props.token1Symbol || this.props.token1.slice(0, 6);
    return `${symbol0}/${symbol1}`;
  }
}

