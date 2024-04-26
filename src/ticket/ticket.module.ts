import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';
import { JwtModule } from '@nestjs/jwt';
import { TicketController } from './ticket.controller';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [PrismaModule, MinioModule, JwtModule],
})
export class TicketModule {}
