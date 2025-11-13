/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import type { ApplicationConfig } from './config/configuration';
import { AppModule } from './app/app.module';
import { TransformResponseInterceptor } from './interfaces/http/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService<ApplicationConfig>);

  app.enableShutdownHooks();
  app.useLogger(new Logger('Backend'));
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalInterceptors(new TransformResponseInterceptor(new Reflector()));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Manexus Onchain Trading Bot API')
    .setDescription('API documentation for the Manexus Onchain Trading Bot')
    .setVersion('1.0')
    .addTag('trading', 'Trading operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port', { infer: true }) ?? 3333;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
