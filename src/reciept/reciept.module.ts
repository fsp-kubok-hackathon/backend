import { Module } from '@nestjs/common';
import { RecieptService } from './reciept.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';
import { JwtModule } from '@nestjs/jwt';
import { RecieptController } from './reciept.controller';
import { GigaModule } from 'src/giga/giga/giga.module';

@Module({
  controllers: [RecieptController],
  providers: [RecieptService],
  exports: [RecieptService],
  imports: [PrismaModule, MinioModule, JwtModule, GigaModule],
})
export class RecieptModule {}
