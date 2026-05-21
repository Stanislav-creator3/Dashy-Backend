import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findUserProjects(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ProjectMembership: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user.ProjectMembership.map((membership) => ({
      ...membership.project,
      role: membership.role,
    }));
  }
}
