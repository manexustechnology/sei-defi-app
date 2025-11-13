import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * Skip transform metadata key - use this decorator to skip transformation for specific routes
 */
export const SKIP_TRANSFORM_KEY = Symbol('skipTransform');

/**
 * Response message metadata key - use this decorator to set custom response messages
 */
export const RESPONSE_MESSAGE_KEY = Symbol('responseMessage');

/**
 * Interceptor that transforms all API responses into a standardized format:
 * {
 *   success: boolean,
 *   data: T,
 *   message?: string,
 *   timestamp: string
 * }
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if the route has @SkipTransform() decorator
    const skipTransform = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTransform) {
      return next.handle();
    }

    // Get custom response message from decorator
    const responseMessage = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      map((data) => {
        // If data is already in the standardized format, return as is (but update message if provided)
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          if (responseMessage) {
            return {
              ...data,
              message: responseMessage,
            };
          }
          return data;
        }

        return {
          success: true,
          data,
          ...(responseMessage && { message: responseMessage }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

