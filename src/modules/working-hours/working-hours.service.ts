import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'prisma/generated';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class WorkingHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveTimer(user: User) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const activeTimer = await this.prisma.workingHours.findFirst({
      where: {
        userId: user.id,
        dateStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!activeTimer) {
      throw new NotFoundException('Таймер не найден');
    }
    return {
      id: activeTimer.id,
      dateStart: activeTimer.dateStart.getTime(),
      isActive: activeTimer.isActive,
    };
  }

  async startTimer(user: User, dateStart: Date) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const activeTimer = await this.prisma.workingHours.findFirst({
      where: {
        userId: user.id,
        dateStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (activeTimer && dateStart) {
      const date = new Date(dateStart);
      const pause =
        activeTimer.totalPause +
        (date.getTime() - activeTimer.dateStart.getTime());

      await this.prisma.workingHours.update({
        where: {
          id: activeTimer.id,
        },
        data: {
          totalPause: pause,
          isActive: true,
        },
      });
      return {
        id: activeTimer.id,
        dateStart: activeTimer.dateStart.getTime(),
        isActive: true,
      };
    }

    const dateEnd = new Date(dateStart);
    dateEnd.setHours(dateEnd.getHours() + 8);

    const timer = await this.prisma.workingHours.create({
      data: {
        dateStart: dateStart,
        dateEnd: dateEnd,
        isActive: true,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    return {
      id: timer.id,
      dateStart: timer.dateStart.getTime(),
    };
  }

  async stopTimer(id: string, datePause: Date) {
    console.log(datePause);
    const activeTimer = await this.prisma.workingHours.findFirst({
      where: {
        id: id,
      },
    });

    if (!activeTimer) {
      throw new NotFoundException('Таймер не найден!');
    }
    await this.prisma.workingHours.update({
      where: {
        id: id,
      },
      data: {
        datePause: {
          push: datePause,
        },
        isActive: false,
      },
    });
    return true;
  }
}
