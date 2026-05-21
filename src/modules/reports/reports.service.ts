import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateReportDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) {
    return await this.prisma.report.create({
      data: {
        periodStart: new Date(createReportDto.periodStart),
        periodEnd: new Date(createReportDto.periodEnd),
        type: createReportDto.type as any, // Fix: cast to any to bypass type error, or replace with correct enum if available
        data: createReportDto.data,
        project: {
          connect: { id: createReportDto.projectId },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(projectId?: string, type?: string) {
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    return await this.prisma.report.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async generateReport(
    projectId: string,
    type: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Здесь можно добавить логику генерации отчета на основе событий
    // Пока возвращаем базовую структуру
    const reportData = {
      totalEvents: 0,
      uniqueUsers: 0,
      period: {
        start: startDate,
        end: endDate,
      },
    };

    return await this.prisma.report.create({
      data: {
        type: type as any,
        data: reportData,
        projectId,
        periodStart: startDate,
        periodEnd: endDate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.report.delete({
        where: { id },
        select: {
          id: true,
          type: true,
          generatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }
      throw error;
    }
  }
}
