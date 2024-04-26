import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [UsersModule],
})
export class AccountModule {}
