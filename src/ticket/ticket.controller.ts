import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { UserClaims } from 'src/auth/dto/user-claims.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadResponseDto } from './dto/upload.dto';
import { UserTicket } from './dto/ticket.dto';

@ApiTags('Чеки')
@Controller('tickets')
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Get('/')
  @ApiOperation({ summary: 'Получение чеков пользователя' })
  @RequiredAuth()
  @ApiResponse({ status: 200, type: [UserTicket] })
  async get(@User('id') userId: string): Promise<UserTicket[]> {
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
