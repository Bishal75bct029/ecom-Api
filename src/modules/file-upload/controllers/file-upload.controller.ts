import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RedisService } from '@/libs/redis/redis.service';
import { envConfig } from '@/configs/envConfig';
import { FileUploadTypeEnum, GetFileUploadSignedTokenDto } from '../dto/file-upload.dto';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { extractFilenameAndExtension } from '@/common/utils';
import { CacheKeysEnum } from '@/libs/redis/types';

@ApiTags('Admin File Upload')
@Controller('admin/file-upload')
@ApiBearerAuth()
export class AdminFileUploadController {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: PasetoJwtService,
  ) {}

  @Post('token')
  async getSignedFileUploadToken(@Body() { name, size, uploadFor }: GetFileUploadSignedTokenDto) {
    const storedSecret = await this.redisService.get(CacheKeysEnum.FILE_SCANNER_KEY, false);

    if (!storedSecret) throw new BadRequestException('Key not found.');

    const keys = JSON.parse(storedSecret) as { previousKey: string; currentKey: string };

    const { baseName, extension } = extractFilenameAndExtension(name);
    let path = `/${uploadFor}/${baseName}-${crypto.randomUUID()}.${extension}`;

    if (uploadFor !== FileUploadTypeEnum.USERS) {
      path = `resources` + path;
    } else {
      path = `private` + path;
    }

    const token = await this.jwtService.signAsync(
      {
        file: {
          originalname: name,
          size: size,
        },
        store: {
          region: envConfig.AWS_REGION,
          source: envConfig.AWS_BUCKET,
          path,
        },
      },
      {
        secret: keys.currentKey,
        expiresIn: 60,
      },
    );
    return { token };
  }
}
