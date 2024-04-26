import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';

export class Ticket {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty()
  status: TicketStatus;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
