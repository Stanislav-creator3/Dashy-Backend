import { UpdateBlockDto } from './dto/update-block.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { toPrismaJsonValue } from 'src/shared/utils/toPrismaJsonValue';
import { Prisma } from 'prisma/generated';

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async getBlocks(id: string) {
    try {
      const blocks = await this.prisma.block.findMany({
        where: { pageId: id },
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

      return buildTree();
    } catch (error) {
      throw error;
    }
  }

  async create(id: string, createBlockDto: CreateBlockDto) {
    const { tempId, content, type, order, parentId, props } = createBlockDto;

    try {
      const block = await this.prisma.block.create({
        data: {
          pageId: id,
          tempId,
          content: (content ?? []) as unknown as Prisma.InputJsonValue,
          type,
          order: order,
          parentId: parentId ?? null,
          props: toPrismaJsonValue(props) ?? {},
        },
      });

      return block;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string[]) {
    try {
      return await this.prisma.block.deleteMany({
        where: { id: { in: id } },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(updateBlockDto: UpdateBlockDto) {
    const { blocks, pageId } = updateBlockDto;
    try {
      const updateBlocks = blocks.filter((item) => item.id != null);
      const createBlocks = blocks.filter(
        (item) => item.id == null && item.tempId != null,
      );

      const createOperations = createBlocks.map((block) =>
        this.prisma.block.create({
          data: {
            pageId,
            type: block.type,
            tempId: block.tempId,
            content: toPrismaJsonValue(block.content) ?? [],
            props: toPrismaJsonValue(block.props) ?? {},
            order: block.order,
            parentId: block.parentId ?? null,
          },
        }),
      );
      const updateOperations = updateBlocks.map((block) =>
        this.prisma.block.update({
          where: { id: block.id },
          data: {
            type: block.type,
            tempId: block.tempId,
            content: toPrismaJsonValue(block.content) ?? [],
            props: toPrismaJsonValue(block.props) ?? {},
            order: block.order,
            parentId: block.parentId ?? null,
          },
        }),
      );

      const results = await this.prisma.$transaction([
        ...updateOperations,
        ...createOperations,
      ]);
      const createdBlocks = results.slice(updateOperations.length);

      return {
        success: true,
        created: createdBlocks.map((item) => ({
          tempId: item.tempId,
          id: item.id,
        })),
      };
    } catch (error) {
      console.error('При обновлении блоков произошла ошибка:', error);
      throw error;
    }
  }

  async updatePosition(
    body: { id: string; order: number; parentId: string }[],
  ) {
    try {
      const transactions = body.map((block) =>
        this.prisma.block.update({
          where: { id: block.id },
          data: { order: block.order, parentId: block.parentId },
        }),
      );
      await this.prisma.$transaction(transactions);
      return true;
    } catch (error) {
      console.error('При обновлении блоков произошла ошибка:', error);
      throw new Error(`При обновлении блоков произошла ошибка: ${error}`);
    }
  }
}
