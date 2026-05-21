import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateUserDto } from './dto';
import { Request } from 'express';
import { getSessionMetadata } from 'src/shared/utils/session-metadata.util';
import { saveSession } from 'src/shared/utils/session.util';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async me(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async create(createUserDto: CreateUserDto, req: Request, userAgent: string) {
    const { email, password, username } = createUserDto;

    try {
      const user = await this.prisma.user.create({
        data: {
          role: 'USER',
          password: await hash(password),
          email,
          username,
        },
      });
      const metadata = getSessionMetadata(req, userAgent);

      return saveSession(req, user, metadata);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким адресом электронной почты уже существует',
        );
      }
      throw error;
    }
  }
}
