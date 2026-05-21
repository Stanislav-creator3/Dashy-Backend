import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { SessionMetadata } from '../types/session-metadata.types';
import { User } from 'prisma/generated';

export function saveSession(
  req: Request,
  user: User,
  metadata: SessionMetadata,
) {
  return new Promise((resolve, reject) => {
    req.session.createdAt = new Date();
    req.session.userId = user.id;
    req.session.metadata = metadata;

    req.session.save((err) => {
      if (err) {
        console.log(err);
        return reject(
          new InternalServerErrorException('Не удалось создать сессию'),
        );
      }
      resolve({ user });
    });
  });
}

export function destroySession(req: Request, configService: ConfigService) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        return reject(
          new InternalServerErrorException('Не удалось завершить сессию'),
        );
      }
      req.res.clearCookie(configService.getOrThrow<string>('SESSION_NAME'));
      resolve(true);
    });
  });
}
