import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY } from '../interceptors/transform-response.interceptor';

/**
 * Decorator to set a custom response message for API endpoints
 * @param message - The custom message to include in the API response
 * @example
 * ```typescript
 * @Get()
 * @ResponseMessage('Orders retrieved successfully')
 * findAll() {
 *   return this.getOrdersUseCase.execute();
 * }
 * ```
 */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);

