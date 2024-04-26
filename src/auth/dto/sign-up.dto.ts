import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  @ApiProperty()
  handle: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  lastName: string;

  @IsString()
  @ApiProperty()
  firstName: string;

  @IsString()
  @ApiProperty()
  middleName: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class SignUpServiceDto {
  handle: string;
  email: string;
  lastName: string;
  firstName: string;
  middleName: string;
  password: string;
  role: Role;
}
