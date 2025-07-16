import { UpsertMovieDto } from './dto/movie.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async add(body: UpsertMovieDto, poster: Express.Multer.File, userId: number) {
    if (!fs.existsSync('uploads/posters')) {
      fs.mkdirSync('uploads/posters');
    }
    const posterUrl = `uploads/posters/${poster.filename}`;
    return await this.prisma.movie.create({
      data: {
        title: body.title,
        publishedYear: Number(body.publishedYear),
        posterUrl,
        createdBy: userId,
      },
    });
  }

  async update(id: string, body: UpsertMovieDto, poster: Express.Multer.File) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: Number(id) },
    });
    let newPosterUrl;
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    if (poster) {
      if (!fs.existsSync('uploads/posters')) {
        fs.mkdirSync('uploads/posters');
      }
      if (movie.posterUrl && fs.existsSync(movie.posterUrl)) {
        fs.unlinkSync(movie.posterUrl);
      }
      newPosterUrl = `uploads/posters/${poster.originalname}`;
    }
    return await this.prisma.movie.update({
      where: { id: Number(id) },
      data: {
        title: body.title ?? movie.title,
        publishedYear: Number(body.publishedYear) ?? movie.publishedYear,
        posterUrl: newPosterUrl ?? movie.posterUrl,
        updatedAt: new Date(),
      },
    });
  }

  async getById(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: Number(id) },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async getCount() {
    return await this.prisma.movie.count();
  }

  async getAll(page: string, limit: string) {
    const movies = await this.prisma.movie.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    return movies;
  }
}
