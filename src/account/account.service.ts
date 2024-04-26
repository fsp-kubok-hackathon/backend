import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProfileDto } from 'src/auth/dto/profile.dto';
import { TicketService } from 'src/ticket/ticket.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger('AccountService');

  constructor(
    private readonly usersService: UsersService,
    private readonly ticketService: TicketService,
  ) {}

  async profile(id: string): Promise<ProfileDto> {
    const user = await this.usersService.findById(id);

    if (!user) {
      this.logger.error('user not found', { id });
      throw new BadRequestException('invalid user id');
    }

    this.logger.verbose('user found', user);

    return {
      id: user.id,
      handle: user.handle,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      role: user.role,
    };
  }

  async tickets(userId: string) {
    return await this.ticketService.findAll({ userId });
  }
}
