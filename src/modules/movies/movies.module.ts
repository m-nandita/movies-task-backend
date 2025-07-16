import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, PrismaService, UsersService],
})
export class MoviesModule {}
