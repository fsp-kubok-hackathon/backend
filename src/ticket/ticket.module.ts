import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [JwtModule, PrismaModule, MinioModule],
})
export class TicketModule {}
