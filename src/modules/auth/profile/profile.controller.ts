import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { User } from 'prisma/generated';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangeInfoDto } from './dto/changeInfoDto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @UseInterceptors(FileInterceptor('file'))
  @Post('change-avatar')
  async changeAvatar(@Authorized() user: User, @UploadedFile() file) {
    return this.profileService.changeAvatar(user, file);
  }

  @Authorization()
  @Delete('remove-avatar')
  async removeAvatar(@Authorized() user: User) {
    return this.profileService.removeAvatar(user);
  }

  @Authorization()
  @Patch('change-password')
  async changePassword(
    @Authorized() user: User,
    @Body() passwordDto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user, passwordDto);
  }

  @Authorization()
  @Patch('change-info')
  async changeUserInfo(
    @Authorized() user: User,
    @Body() changeInfo: ChangeInfoDto,
  ) {
    return this.profileService.changeUserInfo(user, changeInfo);
  }

  @Authorization()
  @Patch('change-email')
  async changeEmail(
    @Authorized() user: User,
    @Body() emailDto: ChangeEmailDto,
  ) {
    return this.profileService.changeEmail(user, emailDto);
  }
}
