import { ApiProperty } from '@nestjs/swagger';

export class UserReciept {
  @ApiProperty()
  imageLink: string;

  @ApiProperty()
  fn: string;

  @ApiProperty()
  fp: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
