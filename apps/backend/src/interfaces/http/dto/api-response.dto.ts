import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Response data',
  })
  data!: T;

  @ApiProperty({
    description: 'Optional message describing the response',
    example: 'Operation completed successfully',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of the response',
    example: '2025-11-13T23:00:00.000Z',
  })
  timestamp!: string;
}

/**
 * Helper function to create Swagger-compatible response DTOs
 */
export function createApiResponseDto<T>(dataType: new () => T) {
  class ApiResponseWithData extends ApiResponseDto<T> {
    @ApiProperty({
      description: 'Response data',
      type: dataType,
    })
    data!: T;
  }
  return ApiResponseWithData;
}

/**
 * Helper function to create Swagger-compatible array response DTOs
 */
export function createApiArrayResponseDto<T>(dataType: new () => T) {
  class ApiResponseWithArrayData extends ApiResponseDto<T[]> {
    @ApiProperty({
      description: 'Response data',
      type: [dataType],
    })
    data!: T[];
  }
  return ApiResponseWithArrayData;
}

