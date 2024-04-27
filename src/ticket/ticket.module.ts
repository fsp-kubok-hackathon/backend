import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';
import { RecieptModule } from 'src/reciept/reciept.module';
import { RecieptCheckerModule } from 'src/reciept-checker/reciept-checker.module';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
  imports: [
    JwtModule,
    PrismaModule,
    MinioModule,
    RecieptModule,
    RecieptCheckerModule,
  ],
})
export class TicketModule {}
