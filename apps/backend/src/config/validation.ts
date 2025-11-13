import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(0)
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @IsString()
  RABBITMQ_URL!: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  ORDERS_CACHE_TTL?: number;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const transformed = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(transformed, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return transformed;
}
