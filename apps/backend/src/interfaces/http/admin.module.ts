import { Module } from '@nestjs/common';

import { SchedulerModule } from '../../infrastructure/scheduler/scheduler.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [SchedulerModule],
  controllers: [AdminController],
})
export class AdminModule {}

