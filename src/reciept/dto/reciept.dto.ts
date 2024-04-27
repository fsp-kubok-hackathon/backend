import { ApiProperty } from '@nestjs/swagger';

export class UserReciept {
  @ApiProperty()
  imageLink: string;

  @ApiProperty()
  fn: string;

  @ApiProperty()
  fp: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
