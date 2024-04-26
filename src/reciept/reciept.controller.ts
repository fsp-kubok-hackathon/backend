import { Controller, Get, Logger } from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
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
  async get(): Promise<UserReciept[]> {
    return await this.service.findAll();
  }
}
