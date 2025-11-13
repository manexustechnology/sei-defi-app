import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PoolSyncService } from '../../infrastructure/scheduler/pool-sync.service';
import { ResponseMessage } from './decorators/response-message.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly poolSyncService: PoolSyncService) {}

  @Post('sync-pools')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Pool sync triggered successfully')
  @ApiOperation({
    summary: 'Manually trigger pool synchronization',
    description: 'Fetches latest pool data from DragonSwap and Sailor Finance immediately',
  })
  @ApiOkResponse({
    description: 'Sync result with counts',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            synced: { type: 'number', example: 10 },
            errors: { type: 'number', example: 0 },
          },
        },
        message: { type: 'string', example: 'Pool sync triggered successfully' },
        timestamp: { type: 'string', example: '2025-11-13T12:00:00.000Z' },
      },
    },
  })
  async syncPools() {
    return await this.poolSyncService.triggerSync();
  }

  @Post('record-pool-history')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Pool history recording triggered successfully')
  @ApiOperation({
    summary: 'Manually trigger pool history recording',
    description: 'Records current state of all pools for historical analysis',
  })
  @ApiOkResponse({
    description: 'Recording result with counts',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            recorded: { type: 'number', example: 10 },
            errors: { type: 'number', example: 0 },
          },
        },
        message: { type: 'string', example: 'Pool history recording triggered successfully' },
        timestamp: { type: 'string', example: '2025-11-13T12:00:00.000Z' },
      },
    },
  })
  async recordPoolHistory() {
    return await this.poolSyncService.triggerHistoryRecording();
  }
}

