import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from '../libs/storage/storage.service';
import * as sharp from 'sharp';
import { CreatePageDto } from './dto/create-page.dto';
import { PageType, Prisma } from 'prisma/generated';
import { UpdatePageDto } from './dto/update-page.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PAGE_VISITED_EVENT } from '../events/events.constants';

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(id: string) {
    try {
      const pages = await this.prisma.page.findMany({
        where: {
          projectId: id,
          parentId: null,
        },
        select: {
          id: true,
          title: true,
          icon: true,
          cover: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return pages;
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string, userId?: string) {
    try {
      const page = await this.prisma.page.findUnique({
        where: { id },
        select: {
          id: true,
          projectId: true,
          title: true,
          icon: true,
          type: true,
          parentId: true,
          blocks: {
            include: { children: true },
            orderBy: { order: 'asc' },
          },
          cover: true,
        },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      const blocks = await this.prisma.block.findMany({
        where: { pageId: page.id },
        orderBy: { order: 'asc' },
      });

      const buildTree = (parentId: string | null = null) =>
        blocks
          .filter((block) => block.parentId === parentId)
          .sort((left, right) => left.order - right.order)
          .map((block) => ({
            ...block,
            children: buildTree(block.id),
          }));

      await this.trackPageVisit(page.id, userId);

      void this.eventEmitter.emitAsync(PAGE_VISITED_EVENT, {
        userId,
      });

      return {
        ...page,
        blocks: buildTree(),
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecentPages(userId: string, projectId?: string) {
    const visits = await this.prisma.pageVisit.findMany({
      where: {
        userId,
        page: {
          isArchived: false,
          ...(projectId ? { projectId } : {}),
        },
      },
      orderBy: {
        visitedAt: 'desc',
      },
      take: 10,
      select: {
        visitedAt: true,
        page: {
          select: {
            id: true,
            title: true,
            icon: true,
            cover: true,
            type: true,
            parentId: true,
            projectId: true,
            updatedAt: true,
            project: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    return visits.map((visit) => ({
      ...visit.page,
      visitedAt: visit.visitedAt,
    }));
  }

  async getPageList(projectId: string, parentId: string | null) {
    try {
      const pages = await this.prisma.page.findMany({
        where: { projectId, isArchived: false },
        select: {
          id: true,
          title: true,
          icon: true,
          type: true,
          parentId: true,
          position: true,
        },
        orderBy: { position: 'asc' },
      });

      const buildTree = (parent: string | null) =>
        pages
          .filter((page) => page.parentId === parent)
          .sort((a, b) => a.position - b.position)
          .map((page) => ({
            ...page,
            children: buildTree(page.id),
          }));

      return buildTree(parentId ?? null);
    } catch (error) {
      throw error;
    }
  }

  async create(projectId: string, createPageDto: CreatePageDto) {
    const { type, title, parentId, position } = createPageDto;

    try {
      const aggregate = await this.prisma.page.aggregate({
        where: { projectId, parentId },
        _max: { position: true },
        _min: { position: true },
      });
      const order =
        position === 'start'
          ? (aggregate._min.position ?? 0) - 1
          : (aggregate._max.position ?? 0) + 1;

      const page = await this.prisma.page.create({
        data: {
          title: title ?? 'Без названия',
          type: type ?? PageType.PAGE,
          projectId: projectId,
          parentId: parentId ?? null,
          position: order,
        },
      });

      if (parentId) {
        const block = await this.prisma.block.findMany({
          where: { pageId: page.parentId },
          take: 1,
          orderBy: { order: 'desc' },
        });
        const order = block[0] ? block[0].order + 1 : 1;

        await this.prisma.block.create({
          data: {
            pageId: page.parentId,
            type: 'LinkPage',
            content: {
              text: page.title,
              icon: page.icon,
              id: page.id,
              typePage: page.type,
            },
            order: order,
          },
        });
      }
      await this.prisma.block.create({
        data: {
          pageId: page.id,
          type: 'Paragraph',
          content: [],
          order: 1,
        },
      });

      return page;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const page = await this.prisma.page.findUnique({
        where: { id },
      });
      if (page.icon) {
        await this.storageService.remove(page.icon);
      }

      const blocks = await this.prisma.block.findMany({
        where: {
          content: {
            path: ['id'],
            equals: id,
          },
        },
      });

      if (blocks.length > 0) {
        await this.prisma.block.deleteMany({
          where: {
            content: {
              path: ['id'],
              equals: id,
            },
          },
        });
      }

      return await this.prisma.page.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    const { title, icon, cover } = updatePageDto;
    try {
      const page = await this.prisma.page.findUnique({
        where: { id },
      });

      if (!page) throw new NotFoundException('Page not found');

      await this.prisma.page.update({
        where: { id },
        data: {
          icon: icon,
          title: title,
          cover: cover,
        },
      });

      await this.syncLinkBlock(page.id);

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async changeCover(pageId: string, file: Express.Multer.File) {
    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (page.cover) {
      await this.storageService.remove(page.cover);
    }

    const fileName = `/cover/${page.id + file.originalname}.webp`;

    if (file.originalname && file.originalname.endsWith('.gif')) {
      const processedBuffer = await sharp(file.buffer, { animated: true })
        .resize({
          width: 2400,
          height: 1350,
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        })
        .webp({
          quality: 70,
          effort: 6,
          smartSubsample: true,
          nearLossless: false,
          loop: 0,
        })
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    } else {
      const processedBuffer = await sharp(file.buffer)
        .resize({
          width: 2400,
          height: 1350,
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        })
        .webp()
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    }

    await this.prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        cover: fileName,
      },
    });

    return true;
  }

  public async removeCover(pageId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page.cover) return;

    if (page.cover.startsWith('/cover/')) {
      await this.storageService.remove(page.cover);
    }

    await this.prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        cover: null,
      },
    });

    return true;
  }

  async reorderPages({
    projectId,
    pages,
  }: {
    projectId: string;
    pages: { id: string; parentId: string | null; position: number }[];
  }) {
    const current = await this.prisma.page.findMany({
      where: { id: { in: pages.map((p) => p.id) }, projectId },
      select: { id: true, parentId: true },
    });

    const prevParent = new Map(current.map((p) => [p.id, p.parentId]));

    await this.prisma.$transaction(async (transaction) => {
      for (const { id, parentId, position } of pages) {
        await transaction.page.update({
          where: { id, projectId },
          data: {
            parentId: parentId,
            position: position,
          },
        });
      }
      for (const { id, parentId } of pages) {
        if (prevParent.get(id) === parentId) continue;
        await this.moveLinkBlock(transaction, id, parentId);
      }
    });

    return true;
  }

  public async changeIcon(pageId: string, file: Express.Multer.File) {
    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (page.icon.startsWith('/icon/')) {
      await this.storageService.remove(page.icon);
    }

    const fileName = `/icon/${page.id + file.originalname}.webp`;

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
    await this.prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        icon: fileName,
      },
    });

    await this.syncLinkBlock(page.id);

    return true;
  }

  public async removeIcon(pageId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page.icon) return;

    if (page.icon.startsWith('/icon/')) {
      await this.storageService.remove(page.icon);
    }

    await this.prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        icon: null,
      },
    });

    await this.syncLinkBlock(page.id);

    return true;
  }

  private mergeBlockContent(
    content: Prisma.JsonValue,
    patch: Record<string, any>,
  ) {
    const base =
      content && typeof content === 'object' && !Array.isArray(content)
        ? content
        : {};

    return {
      ...base,
      ...patch,
    };
  }

  private async syncLinkBlock(pageId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) return;

    const block = await this.prisma.block.findFirst({
      where: {
        type: 'LinkPage',
        content: {
          path: ['id'],
          equals: pageId,
        },
      },
    });

    if (!block) return;

    await this.prisma.block.update({
      where: { id: block.id },
      data: {
        content: this.mergeBlockContent(block.content, {
          text: page.title,
          icon: page.icon,
        }),
      },
    });
  }

  private async moveLinkBlock(
    transaction: Prisma.TransactionClient,
    pageId: string,
    newParentId: string | null,
  ) {
    const page = await transaction.page.findUnique({
      where: { id: pageId },
      select: { id: true, title: true, icon: true, type: true },
    });
    if (!page) return;

    const link = await transaction.block.findFirst({
      where: { type: 'LinkPage', content: { path: ['id'], equals: pageId } },
    });

    if (!newParentId) {
      if (link) await transaction.block.delete({ where: { id: link.id } });
      return;
    }

    const last = await transaction.block.findFirst({
      where: { pageId: newParentId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = last ? last.order + 1 : 1;

    if (link) {
      await transaction.block.update({
        where: { id: link.id },
        data: { pageId: newParentId, parentId: null, order },
      });
    } else {
      await transaction.block.create({
        data: {
          pageId: newParentId,
          type: 'LinkPage',
          parentId: null,
          order,
          content: {
            text: page.title,
            icon: page.icon,
            id: page.id,
            typePage: page.type,
          },
        },
      });
    }
  }

  private async trackPageVisit(pageId: string, userId?: string) {
    if (!userId) {
      return;
    }

    await this.prisma.pageVisit.upsert({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
      update: {
        visitedAt: new Date(),
      },
      create: {
        userId,
        pageId,
        visitedAt: new Date(),
      },
    });
  }
}
