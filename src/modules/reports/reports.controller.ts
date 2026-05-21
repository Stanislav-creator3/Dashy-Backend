import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Post('generate/:projectId')
  generateReport(
    @Param('projectId') projectId: string,
    @Body() body: { type: string; startDate: string; endDate: string },
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    return this.reportsService.generateReport(
      projectId,
      body.type,
      startDate,
      endDate,
    );
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
  ) {
    return this.reportsService.findAll(projectId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
