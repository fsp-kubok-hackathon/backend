import { Module } from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';
import { JwtModule } from '@nestjs/jwt';
import { RecieptController } from './reciept.controller';

@Module({
  controllers: [RecieptController],
  providers: [RecieptService],
  imports: [PrismaModule, MinioModule, JwtModule],
})
export class RecieptModule {}
