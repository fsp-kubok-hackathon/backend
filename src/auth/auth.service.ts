import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { SignUpDto, SignUpServiceDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { hash, compare } from 'bcryptjs';
import { isEmail } from 'class-validator';
import { UserClaims } from './dto/user-claims.dto';
import { Role } from '@prisma/client';

const SALT = Number(process.env.BCRYPT_SALT);

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async signUp(dto: SignUpServiceDto) {
    if (!!(await this.usersService.findByEmail(dto.email))) {
      this.logger.debug(`email=${dto.email} already taken`);
      throw new ConflictException('email already taken');
    }

    if (!!(await this.usersService.findByHandle(dto.handle))) {
      this.logger.debug(`handle=${dto.handle} already taken`);
      throw new ConflictException('handle already taken');
    }

    this.logger.verbose('signing up user', dto);

    const hashPassword = await hash(dto.password, SALT);

    await this.usersService.create({
      ...dto,
      password: hashPassword,
      role: dto.role,
    });

    const user = await this.usersService.findByHandle(dto.handle);

    return await this.generateTokens({
      id: user.id,
      handle: user.handle,
      role: user.role,
    });
  }

  async signIn(dto: SignInDto) {
    const user = isEmail(dto.login)
      ? await this.usersService.findByEmail(dto.login)
      : await this.usersService.findByHandle(dto.login);

    if (!user) {
      this.logger.debug(`user not found, user=${JSON.stringify(dto)}`);
      throw new NotFoundException('user not found');
    }

    this.logger.verbose(`user found`, user);

    if (!(await compare(dto.password, user.password))) {
      this.logger.debug(
        `invalid password user=${JSON.stringify(dto)} user.password=${user.password}`,
      );
      throw new BadRequestException('invalid login or password');
    }

    return await this.generateTokens({
      id: user.id,
      handle: user.handle,
      role: user.role,
    });
  }

  async logout(id: string) {
    this.logger.verbose('logout user', { id });
    this.redisService.clear(id);
  }

  async refresh(token: string) {
    this.logger.verbose("refresh user's tokens", { token });

    try {
      const user: UserClaims = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return this.generateTokens(user);
    } catch (e) {
      this.logger.error('bad refresh token', e);
      throw new ForbiddenException('bad refresh token');
    }
  }

  async generateTokens(dto: UserClaims) {
    this.logger.verbose('generating tokens');
    const accessToken = await this.jwtService.signAsync(
      {
        id: dto.id,
        handle: dto.handle,
        role: dto.role,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: `${process.env.JWT_ACCESS_TTL}m`,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        id: dto.id,
        handle: dto.handle,
        role: dto.role,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: `${process.env.JWT_REFRESH_TTL}h`,
      },
    );

    this.logger.verbose('tokens generated', { accessToken, refreshToken });

    this.logger.verbose('saving refresh token');
    await this.redisService.set(dto.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
