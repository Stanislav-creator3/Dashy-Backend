import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Authorized } from 'src/shared/decorators/authorized.decorator';

@Controller(':projectId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Authorization()
  @Get('/all/:id')
  findAll(@Param('id') id: string) {
    return this.pagesService.getAll(id);
  }

  @Authorization()
  @Get()
  getList(
    @Param('projectId') projectId: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.pagesService.getPageList(projectId, parentId);
  }

  @Authorization()
  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() CreatePageDto: CreatePageDto,
  ) {
    return this.pagesService.create(projectId, CreatePageDto);
  }

  @Authorization()
  @Get('/visit')
  getRecentPages(
    @Authorized('id') userId: string,
    @Param('projectId') projectId?: string,
  ) {
    return this.pagesService.getRecentPages(userId, projectId);
  }

  @Authorization()
  @Get(':id')
  findOne(@Param('id') id: string, @Authorized('id') userId: string) {
    return this.pagesService.getById(id, userId);
  }

  @Authorization()
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, UpdatePageDto);
  }

  @Authorization()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Authorization()
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/cover/:id')
  changeCover(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpg|jpeg|png|webp|gif)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'Максимальный размер файла 5мб',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.pagesService.changeCover(id, file);
  }

  @Authorization()
  @Delete('/cover/:id')
  removeCover(@Param('id') id: string) {
    return this.pagesService.removeCover(id);
  }

  @Authorization()
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/icon/:id')
  changeIcon(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpg|jpeg|png|webp|gif)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'Максимальный размер файла 5мб',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.pagesService.changeIcon(id, file);
  }

  @Authorization()
  @Delete('/icon/:id')
  removeIcon(@Param('id') id: string) {
    return this.pagesService.removeIcon(id);
  }
}
