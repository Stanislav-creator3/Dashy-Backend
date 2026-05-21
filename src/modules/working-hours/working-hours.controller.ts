import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { User } from 'prisma/generated';

@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  @Authorization()
  @Get()
  async getActiveTimer(@Authorized() user: User) {
    return await this.workingHoursService.getActiveTimer(user);
  }

  @Authorization()
  @Post()
  async startTimer(
    @Authorized() user: User,
    @Body('dateStart') dateStart: Date,
  ) {
    return await this.workingHoursService.startTimer(user, dateStart);
  }

  @Authorization()
  @Patch()
  async stopTimer(@Body('datePause') datePause: Date, @Body('id') id: string) {
    return await this.workingHoursService.stopTimer(id, datePause);
  }
}
