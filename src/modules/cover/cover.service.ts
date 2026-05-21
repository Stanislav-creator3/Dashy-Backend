import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class CoverService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.cover.findMany();
  }
}
