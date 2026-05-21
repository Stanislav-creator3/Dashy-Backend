import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return await this.prisma.event.create({
      data: createEventDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(projectId?: string, userId?: string, type?: string) {
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    return await this.prisma.event.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async getEventStats(projectId: string, startDate?: Date, endDate?: Date) {
    const where: any = { projectId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [totalEvents, uniqueUsers, eventsByType] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
      }),
      this.prisma.event.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
    ]);

    return {
      totalEvents,
      uniqueUsers: uniqueUsers.filter((u) => u.userId).length,
      eventsByType: eventsByType.map((e) => ({
        type: e.type,
        count: e._count.type,
      })),
    };
  }

  async remove(id: string) {
    try {
      return await this.prisma.event.delete({
        where: { id },
        select: {
          id: true,
          type: true,
          timestamp: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw error;
    }
  }
}
