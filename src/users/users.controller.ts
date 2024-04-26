import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { RequiredAuth } from 'src/auth/decorators/auth.decorator';
import { PromoteUserDto } from './dto/promote-user.dto';
import { User } from './entities/user.entity';
import { ListDto } from 'src/dto/list.dto';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService) {}
}
