import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @UserAgent() userAgent: string,
  ) {
    return this.authService.create(createUserDto, req, userAgent);
  }

  @Authorization()
  @Get()
  async me(@Authorized('id') id: string) {
    return await this.authService.me(id);
  }
}
