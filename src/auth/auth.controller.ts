import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ErrorDto } from 'src/dto/error.dto';
import { RequiredAuth } from './decorators/auth.decorator';
import { Role } from '@prisma/client';

// const REFRESH_TOKEN = 'refreshToken';
// const COOKIE_OPTIONS: CookieOptions = {
//   // httpOnly: true,
//   expires: addHours(Number(process.env.JWT_REFRESH_TTL)),
//   // sameSite: 'none',
//   // secure: false,
//   domain: process.env.COOKIE_DOMAIN,
// };

@Controller('auth')
@ApiTags('Авторизация')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly service: AuthService) {}

  @Post('/employee/sign-up')
  @ApiOperation({ summary: 'Регистрация нового работника' })
  @UsePipes(ValidationPipe)
  async employeeSignUp(@Body() dto: SignUpDto) {
    const { accessToken, refreshToken } = await this.service.signUp({
      ...dto,
      role: Role.EMPLOYEE,
    });

    this.logger.verbose('saving cookie', { refreshToken });
    return { accessToken, refreshToken };
  }

  @Post('/accountant/sign-up')
  @ApiOperation({ summary: 'Регистрация нового бухгалтера' })
  @UsePipes(ValidationPipe)
  async accountantSignUp(@Body() dto: SignUpDto) {
    const { accessToken, refreshToken } = await this.service.signUp({
      ...dto,
      role: Role.ACCOUNTANT,
    });

    this.logger.verbose('saving cookie', { refreshToken });
    return { accessToken, refreshToken };
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ type: ErrorDto })
  @UsePipes(ValidationPipe)
  async signIn(@Body() dto: SignInDto) {
    const { accessToken, refreshToken } = await this.service.signIn(dto);
    this.logger.verbose('saving cookie', { refreshToken });
    return { accessToken, refreshToken };
  }

  @Get('logout')
  @RequiredAuth()
  async logout(@Req() req: Request) {
    await this.service.logout(req['user'].id);
    this.logger.verbose('clearing cookie');
  }

  @Post('refresh')
  async refresh(@Body() dto: { refreshToken: string }) {
    const token = dto.refreshToken;
    this.logger.verbose('refreshing token', dto);
    if (!token) {
      this.logger.verbose('refresh token is missing');
      throw new BadRequestException('refresh token is missing');
    }
    const { accessToken, refreshToken } = await this.service.refresh(token);
    return { accessToken, refreshToken };
  }
}
