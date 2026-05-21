import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('findByUser')
  async findByUser(@Req() req: Request) {
    return await this.sessionService.findByUser(req);
  }

  @Get('current')
  async findCurrent(@Req() req: Request) {
    return await this.sessionService.findCurrent(req);
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @UserAgent() userAgent: string,
  ) {
    return await this.sessionService.login(req, loginDto, userAgent);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    return await this.sessionService.logout(req);
  }

  @Post('remove')
  async removeSession(@Req() req: Request, @Body() id: string) {
    return await this.sessionService.removeSession(req, id);
  }
}
