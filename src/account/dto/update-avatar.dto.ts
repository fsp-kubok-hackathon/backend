import { ApiProperty } from '@nestjs/swagger';

export class AvatarUpdateRequestDto {
  @ApiProperty({
    type: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  readonly file: Express.Multer.File;
}

export class AvatarUpdateResponseDto {
  @ApiProperty()
  link: string;
}
