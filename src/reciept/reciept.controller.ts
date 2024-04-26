import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
  Logger,
} from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { UserClaims } from 'src/auth/dto/user-claims.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadResponseDto } from './dto/upload.dto';
import { UserReciept } from './dto/reciept.dto';

@ApiTags('Чеки')
@Controller('reciepts')
export class RecieptController {
  private readonly logger = new Logger('RecieptController');

  constructor(private readonly service: RecieptService) {}

  @Get('/')
  @ApiOperation({ summary: 'Получение чеков пользователя' })
  @RequiredAuth()
  @ApiResponse({ status: 200, type: [UserReciept] })
  async get(@User('id') userId: string): Promise<UserReciept[]> {
    return await this.service.getByUser(userId);
  }

  @Post('/upload')
  @ApiOperation({ summary: 'Загрузка фотографии чека' })
  @RequiredAuth('EMPLOYEE')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiResponse({ status: 200, type: UploadResponseDto })
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @User() user: UserClaims,
  ): Promise<UploadResponseDto> {
    const created = await this.service.upload(user.id, files);
    return { created };
  }
}
