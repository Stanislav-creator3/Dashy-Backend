import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();
    const user = await this.prismaService.user.findUnique({
      where: {
        id: request.session.userId,
      },
    });

    request.user = user;

    return true;
  }
}
