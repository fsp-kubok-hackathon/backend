import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { Report } from 'src/report/entities/report.entity';
import { User } from 'src/users/entities/user.entity';

export class Ticket {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  user?: User;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  status: TicketStatus;

  @ApiProperty({ required: false })
  report: Report;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
