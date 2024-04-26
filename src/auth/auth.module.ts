import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [JwtModule, UsersModule, RedisModule, LoggerModule],
})
export class AuthModule {}
