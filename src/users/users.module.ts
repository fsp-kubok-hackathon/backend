import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, JwtModule, MinioModule],
  imports: [PrismaModule, JwtModule, MinioModule],
})
export class UsersModule {}
