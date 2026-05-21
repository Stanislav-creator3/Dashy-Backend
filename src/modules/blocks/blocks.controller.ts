import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Get,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Authorization()
  @Get(':id')
  getBlocks(@Param('id') id: string) {
    return this.blocksService.getBlocks(id);
  }

  @Authorization()
  @Post(':id')
  create(@Param('id') id: string, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(id, createBlockDto);
  }

  @Authorization()
  @Delete()
  remove(@Body() id: string[]) {
    return this.blocksService.remove(id);
  }

  @Authorization()
  @Patch()
  update(@Body() updateBlockDto: UpdateBlockDto) {
    return this.blocksService.update(updateBlockDto);
  }

  @Authorization()
  @Patch('order')
  updatePosition(
    @Body() body: { id: string; order: number; parentId: string }[],
  ) {
    return this.blocksService.updatePosition(body);
  }
}
