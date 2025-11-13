import { SetMetadata } from '@nestjs/common';
import { SKIP_TRANSFORM_KEY } from '../interceptors/transform-response.interceptor';

/**
 * Decorator to skip response transformation for specific routes
 * Use this when you need to return raw responses (e.g., file downloads, streaming)
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

