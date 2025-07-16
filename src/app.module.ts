import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MoviesModule } from './modules/movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter';
import { UsersModule } from './modules/users/users.module';
import { ZodExceptionFilter } from './filters/zod-exception.filter';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    }),
    MoviesModule,
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
