import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UsersModule } from 'src/users/users.module';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [UsersModule, TicketModule],
})
export class AccountModule {}
