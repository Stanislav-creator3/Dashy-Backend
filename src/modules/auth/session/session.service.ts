import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RedisService } from 'src/core/redis/redis.service';
import type { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { getSessionMetadata } from 'src/shared/utils/session-metadata.util';
import { saveSession } from 'src/shared/utils/session.util';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId;

    if (!userId) {
      throw new NotFoundException('Пользовать отсутствует в сессии');
    }

    const keys = await this.redisService.keys('*');

    const userSession = [];

    for (const key of keys) {
      const session = await this.redisService.get(key);
      if (session) {
        const parsedSession = JSON.parse(session);
        if (parsedSession.userId === userId) {
          userSession.push({
            ...parsedSession,
            id: key.split(':')[1],
          });
        }
      }
    }

    userSession.sort((a, b) => b.createdAt - a.createdAt);

    return userSession.filter((session) => session.id !== req.session.id);
  }

  public async findCurrent(req: Request) {
    const sessionId = req.session.id;

    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    );

    const session = JSON.parse(sessionData);

    return {
      ...session,
      id: sessionId,
    };
  }

  public async login(req: Request, loginDto: LoginDto, userAgent: string) {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('Неверный пароль');
    }

    // if (user.isTotpEnabled) {
    //   if (!pin) {
    //     return {
    //       message: 'Необходим код для завершения авторизации',
    //     };
    //   }
    // }

    const metadata = getSessionMetadata(req, userAgent);

    return saveSession(req, user, metadata);
  }

  public async logout(req: Request) {
    return this.destroySession(req, this.configService);
  }

  public async removeSession(req: Request, id: string) {
    if (req.session.id === id) {
      throw new ConflictException('Нельзя удалить текущую сессию');
    }
    await this.redisService.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`,
    );
    return true;
  }

  public async destroySession(req: Request, configService: ConfigService) {
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
}
