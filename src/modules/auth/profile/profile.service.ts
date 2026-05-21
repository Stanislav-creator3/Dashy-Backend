import { Injectable, UnauthorizedException } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { User } from 'prisma/generated';
import * as sharp from 'sharp';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/modules/libs/storage/storage.service';
import { ChangeInfoDto } from './dto/changeInfoDto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ChangeEmailDto } from './dto/changeEmail.dto';

@Injectable()
export class ProfileService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  public async changeAvatar(user: User, file: any) {
    if (user.avatar) {
      await this.storageService.remove(user.avatar);
    }

    const fileName = `/user/${user.username + file.originalname}.webp`;

    if (file.originalname && file.originalname.endsWith('.gif')) {
      const processedBuffer = await sharp(file.buffer, { animated: true })
        .resize({
          width: 256,
          height: 256,
          withoutEnlargement: true,
        })
        .webp({
          effort: 6,
          loop: 0,
        })
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    } else {
      const processedBuffer = await sharp(file.buffer)
        .resize({
          width: 256,
          height: 256,
          withoutEnlargement: true,
        })
        .webp({
          effort: 6,
          alphaQuality: 90,
        })
        .toBuffer();

      await this.storageService.upload(processedBuffer, fileName, 'image/webp');
    }

    const updateUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: fileName,
      },
    });

    return updateUser;
  }

  public async removeAvatar(user: User) {
    if (!user.avatar) return;

    await this.storageService.remove(user.avatar);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: null,
      },
    });

    return true;
  }

  public async changeEmail(user: User, emailDto: ChangeEmailDto) {
    const { email } = emailDto;

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
      },
    });

    return true;
  }

  public async changePassword(user: User, passwordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = passwordDto;

    const isValidPassword = await verify(user.password, oldPassword);

    if (!isValidPassword) {
      throw new UnauthorizedException('Неверный пароль');
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hash(newPassword),
      },
    });

    return true;
  }

  public async changeUserInfo(user: User, changeInfo: ChangeInfoDto) {
    const { username } = changeInfo;

    const updateUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        username,
      },
    });

    return updateUser;
  }
}
