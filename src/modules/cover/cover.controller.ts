import { Controller, Get } from '@nestjs/common';
import { CoverService } from './cover.service';
import { Authorization } from 'src/shared/decorators/auth.decorator';

@Controller('cover')
export class CoverController {
  constructor(private readonly coverService: CoverService) {}

  @Authorization()
  @Get()
  async getAll() {
    return await this.coverService.getAll();
  }
}
