import { Module } from '@nestjs/common';
import { CoverService } from './cover.service';
import { CoverController } from './cover.controller';

@Module({
  controllers: [CoverController],
  providers: [CoverService],
})
export class CoverModule {}
