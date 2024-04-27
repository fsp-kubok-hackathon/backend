import { Module } from '@nestjs/common';
import { RecieptCheckerService } from './reciept-checker.service';

@Module({
  providers: [RecieptCheckerService],
  exports: [RecieptCheckerService],
})
export class RecieptCheckerModule {}
