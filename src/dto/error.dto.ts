import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ type: String })
  message: string;
  @ApiProperty({ type: String })
  error: string;
  @ApiProperty({ type: Number })
  statusCode: number;
}
