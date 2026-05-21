import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { PagesService } from '../pages/pages.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pagesService: PagesService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Authorization()
  @Get('recent-pages')
  getRecentPages(
    @Authorized('id') userId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.pagesService.getRecentPages(userId, projectId);
  }

  @Authorization()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Authorization()
  @Get(':id/projects')
  findUserProjects(@Param('id') id: string) {
    return this.usersService.findUserProjects(id);
  }

  @Authorization()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @Authorization()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
