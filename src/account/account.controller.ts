import { Controller, Get, Logger } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from 'src/auth/dto/profile.dto';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { UserClaims } from 'src/auth/dto/user-claims.dto';

@ApiTags('Аккаунт пользователя')
@Controller('account')
export class AccountController {
  private readonly logger = new Logger('AccountController');

  constructor(private readonly service: AccountService) {}

  @Get('')
  @ApiOperation({ summary: 'Получение профиля авторизованного пользователя' })
  @RequiredAuth()
  @ApiResponse({ type: ProfileDto })
  async profile(@User() { id }: UserClaims): Promise<ProfileDto> {
    this.logger.verbose('getting profile', { id });
    const user = await this.service.profile(id);
    return user;
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Получение списка счетов пользователя' })
  @ApiResponse({ status: 200 })
  @RequiredAuth('EMPLOYEE')
  async tickets(@User('id') userId: string) {
    this.logger.verbose('getting tickets', { userId });
    const tickets = await this.service.tickets(userId);
    return tickets;
  }
}
