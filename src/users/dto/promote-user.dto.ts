import { ApiProperty } from '@nestjs/swagger';

export class PromoteUserDto {
  @ApiProperty()
  role: string;
}
