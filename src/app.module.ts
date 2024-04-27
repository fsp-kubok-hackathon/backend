import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { AccountModule } from './account/account.module';
import { MinioModule } from './minio/minio.module';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ReportModule } from './report/report.module';
import { RecieptModule } from './reciept/reciept.module';
import { TicketModule } from './ticket/ticket.module';
import { RecieptCheckerModule } from './reciept-checker/reciept-checker.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ envFilePath: '.env' }),
    RedisModule,
    UsersModule,
    AuthModule,
    LoggerModule,
    AccountModule,
    MinioModule,
    ReportModule,
    RecieptModule,
    TicketModule,
    RecieptCheckerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
