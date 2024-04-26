import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUUID } from 'class-validator';
import { uuidv7 } from 'uuidv7';
import { MinioService } from 'src/minio/minio.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  create(dto: CreateUserDto) {
    const id = uuidv7();

    return this.prisma.user.create({
      data: {
        id: id,
        email: dto.email,
        lastName: dto.lastName,
        firstName: dto.firstName,
        middleName: dto.middleName,
        handle: dto.handle,
        password: dto.password,
        role: dto.role,
      },
    });
  }

  async findAll(filters: Prisma.UserWhereInput) {
    return {
      users: await this.prisma.user.findMany({
        where: { ...filters },
        orderBy: { createdAt: 'asc' },
      }),
      count: await this.prisma.user.count({
        where: { ...filters },
      }),
    };
  }

  async findOne(slug: string) {
    const u = isUUID(slug) ? this.findById(slug) : this.findByHandle(slug);
    return await u;
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByHandle(handle: string) {
    return await this.prisma.user.findUnique({
      where: { handle },
    });
  }
}
