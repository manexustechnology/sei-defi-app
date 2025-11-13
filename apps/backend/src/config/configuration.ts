export type ApplicationConfig = {
  app: {
    port: number;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  rabbitmq: {
    url: string;
    exchange: string;
  };
  cache: {
    ordersTtlSeconds: number;
  };
};

export default (): ApplicationConfig => ({
  app: {
    port: parseInt(process.env.PORT ?? '3333', 10),
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/trading',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'orders',
  },
  cache: {
    ordersTtlSeconds: parseInt(process.env.ORDERS_CACHE_TTL ?? '30', 10),
  },
});
