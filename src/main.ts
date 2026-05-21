import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { parseBoolean } from './shared/utils/parse-boolen.util';
import { ms, type StringValue } from './shared/utils/ms.util';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule, { rawBody: true });

  const config = app.get(ConfigService);

  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
  });

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
      store: redisStore,
    }),
  );

  app.enableCors({
    origin: [
      config.getOrThrow<string>('ALLOWED_ORIGIN'),
      'http://localhost:6006',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
bootstrap();
