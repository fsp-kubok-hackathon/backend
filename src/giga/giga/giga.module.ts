import { Module } from '@nestjs/common';
import { GigaService } from './giga.service';

@Module({
  providers: [GigaService],
  exports: [GigaService],
})
export class GigaModule {}
