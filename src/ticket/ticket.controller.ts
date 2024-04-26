import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserClaims } from 'src/auth/dto/user-claims.dto';
import { UploadResponseDto } from 'src/reciept/dto/upload.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UserReciept } from 'src/reciept/dto/reciept.dto';
import { RecieptService } from 'src/reciept/reciept.service';
import { Ticket } from './entity/ticket.entity';
import { Role } from '@prisma/client';
import { stat } from 'fs';
import { TicketStatus } from '@prisma/client';
import { ListFilter } from 'src/decorators/listFilter.decorator';

@ApiTags('Тикет')
@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly service: TicketService,
    private readonly recieptService: RecieptService,
  ) {}

  @Post('/upload')
  @ApiOperation({ summary: 'Загрузка фотографии чеков для тикета' })
  @RequiredAuth('EMPLOYEE')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(AnyFilesInterceptor())
  @ApiResponse({ status: 200, type: UploadResponseDto })
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() { endDate, startDate }: CreateTicketDto,
    @User() user: UserClaims,
  ) {
    return await this.service.upload(user.id, files, startDate, endDate);
  }

  @Get()
  @ApiOperation({ summary: 'Получение всех тикетов' })
  @ApiResponse({ status: 200, type: [Ticket] })
  @RequiredAuth('ACCOUNTANT')
  @ListFilter()
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Query('status') status: TicketStatus,
  ): Promise<Ticket[]> {
    this.logger.verbose('findAll tickets', { limit, offset, status });
    return await this.service.findAll();
  }

  @Get('/:id/reciepts')
  @ApiOperation({ summary: 'Получение чеков по id тикета' })
  @RequiredAuth()
  @ApiResponse({ status: 200, type: [UserReciept] })
  async getReciepts(@Param('id') ticketId: string): Promise<UserReciept[]> {
    return await this.service.findAllRecieptsById(ticketId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Получение тикета по id' })
  @RequiredAuth()
  @ApiResponse({ status: 200, type: Ticket })
  async getTicketById(@Param('id') ticketId: string, @User() user: UserClaims) {
    this.logger.verbose('getTicketById', { ticketId });
    const ticket = await this.service.findById(ticketId);
    if (user.role === Role.EMPLOYEE && ticket.userId !== user.id) {
      throw new ForbiddenException('Forbidden');
    }

    return ticket;
  }
}
