import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.util';
import { AuthModule } from 'src/modules/auth/account/auth.module';
import { SessionModule } from 'src/modules/auth/session/session.module';
import { EventsModule } from 'src/modules/events/events.module';
import { ProjectsModule } from 'src/modules/projects/projects.module';
import { ReportsModule } from 'src/modules/reports/reports.module';
import { UsersModule } from 'src/modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { WorkingHoursModule } from 'src/modules/working-hours/working-hours.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BlocksModule } from 'src/modules/blocks/blocks.module';
import { PagesModule } from 'src/modules/pages/pages.module';
import { StorageModule } from 'src/modules/libs/storage/storage.module';
import { CoverModule } from 'src/modules/cover/cover.module';
import { ProfileModule } from 'src/modules/auth/profile/profile.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    SessionModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RedisModule,
    UsersModule,
    ProjectsModule,
    EventsModule,
    ReportsModule,
    WorkingHoursModule,
    PagesModule,
    BlocksModule,
    StorageModule,
    CoverModule,
    ProfileModule,
  ],
})
export class CoreModule {}
