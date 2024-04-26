import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  handle: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  role: string;
}
