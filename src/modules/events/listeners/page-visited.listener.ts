import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAGE_VIEW_TYPE, PAGE_VISITED_EVENT } from '../events.constants';
import { EventsService } from '../events.service';

type PageVisitedPayload = {
  pageId: string;
  projectId: string;
  userId?: string;
};

@Injectable()
export class PageVisitedListener {
  constructor(private readonly eventsService: EventsService) {}

  @OnEvent(PAGE_VISITED_EVENT)
  async handle(payload: PageVisitedPayload) {
    await this.eventsService.create({
      type: PAGE_VIEW_TYPE,
      projectId: payload.projectId,
      userId: payload.userId,
      metadata: {
        pageId: payload.pageId,
        visitedAt: new Date().toISOString(),
      },
    });
  }
}
