import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { User } from 'prisma/generated';
import { FileInterceptor } from '@nestjs/platform-express';
import { Authorization } from 'src/shared/decorators/auth.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Authorization()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Authorized() user: User,
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
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
    file?: Express.Multer.File,
  ) {
    return this.projectsService.create(user, createProjectDto, file);
  }

  @Authorization()
  @Patch('/previewImage/:id')
  @UseInterceptors(FileInterceptor('file'))
  updatePreviewImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpg|jpeg|png|webp)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
            message: 'Максимальный размер файла 5мб',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') projectId: string,
  ) {
    return this.projectsService.updatePreviewImage(projectId, file);
  }

  @Authorization()
  @Get()
  findAll(@Authorized('id') userId: string) {
    return this.projectsService.findAll({ userId });
  }

  @Authorization()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Authorization()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Authorization()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Authorization()
  @Post(':id/members')
  addMember(
    @Param('id') projectId: string,
    @Body() body: { userId: string; role: string },
  ) {
    return this.projectsService.addMember(projectId, body.userId, body.role);
  }

  @Authorization()
  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(projectId, userId);
  }

  @Authorization()
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/:id/icon')
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
    return this.projectsService.changeIcon(id, file);
  }

  @Authorization()
  @Delete('/:id/icon/')
  removeIcon(@Param('id') id: string) {
    return this.projectsService.removeIcon(id);
  }
}
