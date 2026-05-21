import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PageVisitedListener } from './listeners/page-visited.listener';

@Module({
  controllers: [EventsController],
  providers: [EventsService, PageVisitedListener],
  exports: [EventsService],
})
export class EventsModule {}
