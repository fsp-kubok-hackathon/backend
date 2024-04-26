import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserClaims } from 'src/auth/dto/user-claims.dto';
import { UploadResponseDto } from 'src/reciept/dto/upload.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('Тикет')
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(private readonly service: TicketService) {}

  @Post('/upload')
  @ApiOperation({ summary: 'Загрузка фотографии чека' })
  @RequiredAuth('EMPLOYEE')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(AnyFilesInterceptor())
  @ApiResponse({ status: 200, type: UploadResponseDto })
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() { endDate, startDate }: CreateTicketDto,
    @User() user: UserClaims,
  ) {
    const created = await this.service.upload(
      user.id,
      files,
      startDate,
      endDate,
    );
    // return { created };
  }
}
