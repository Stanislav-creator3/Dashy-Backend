import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../libs/storage/storage.service';
import * as sharp from 'sharp';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    user,
    createProjectDto: CreateProjectDto,
    file?: Express.Multer.File,
  ) {
    const { name } = createProjectDto;
    const project = await this.prisma.project.create({
      data: { name, userId: user.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (file) {
      const fileName = `/icon/project/${project.id + file.originalname}.webp`;

      if (file.originalname && file.originalname.endsWith('.gif')) {
        const processedBuffer = await sharp(file.buffer, { animated: true })
          .resize({
            width: 256,
            height: 256,
            withoutEnlargement: true,
          })
          .webp({
            effort: 6,
            loop: 0,
          })
          .toBuffer();

        await this.storageService.upload(
          processedBuffer,
          fileName,
          'image/webp',
        );
      } else {
        const processedBuffer = await sharp(file.buffer)
          .resize({
            width: 256,
            height: 256,
            withoutEnlargement: true,
          })
          .webp({
            effort: 6,
            alphaQuality: 90,
          })
          .toBuffer();

        await this.storageService.upload(
          processedBuffer,
          fileName,
          'image/webp',
        );
      }

      const updatedProject = await this.prisma.project.update({
        where: { id: project.id },
        data: { icon: fileName },
      });

      return updatedProject;
    }
    return project;
  }

  async updatePreviewImage(projectId: string, file: Express.Multer.File) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      `${project.name}-${project.id}`,
      'previewImage',
    );

    const filePath = path.join(uploadDir, file.originalname);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const relativePath = path.join(
      'uploads',
      `${project.name}-${project.id}`,
      'previewImage',
      file.originalname,
    );

    fs.writeFileSync(filePath, file.buffer);

    const updatedProject = await this.prisma.project.update({
      where: { id: project.id },
      data: { previewImage: relativePath },
    });

    return { previewImage: updatedProject.previewImage };
  }

  async findAll({ userId }: { userId: string }) {
    return await this.prisma.project.findMany({
      where: { userId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            events: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
        events: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
        reports: {
          take: 5,
          orderBy: { generatedAt: 'desc' },
        },
        _count: {
          select: {
            events: true,
            reports: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      throw error;
    }
  }

  public async changeIcon(id: string, file: Express.Multer.File) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: id,
      },
    });

    if (project.icon.startsWith('/icon/project/')) {
      await this.storageService.remove(project.icon);
    }

    const fileName = `/icon/project/${project.id + file.originalname}.webp`;

    if (file.originalname && file.originalname.endsWith('.gif')) {
      const processedBuffer = await sharp(file.buffer, { animated: true })
        .resize({
          width: 256,
          height: 256,
          withoutEnlargement: true,
        })
        .webp({
          effort: 6,
          loop: 0,
        })
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    } else {
      const processedBuffer = await sharp(file.buffer)
        .resize({
          width: 256,
          height: 256,
          withoutEnlargement: true,
        })
        .webp({
          effort: 6,
          alphaQuality: 90,
        })
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    }
    await this.prisma.project.update({
      where: {
        id: id,
      },
      data: {
        icon: fileName,
      },
    });

    return true;
  }

  public async removeIcon(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: id },
    });

    if (!project.icon) return;

    if (project.icon.startsWith('/icon/project/')) {
      await this.storageService.remove(project.icon);
    }

    await this.prisma.project.update({
      where: {
        id: id,
      },
      data: {
        icon: null,
      },
    });

    return true;
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      throw error;
    }
  }

  async addMember(projectId: string, userId: string, role: string) {
    return await this.prisma.projectMembership.create({
      data: {
        projectId,
        userId,
        role: role as any,
      },
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

  async removeMember(projectId: string, userId: string) {
    return await this.prisma.projectMembership.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }
}
