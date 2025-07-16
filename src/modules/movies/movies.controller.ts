import { AuthGuard } from 'src/guards/auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  Query,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UpsertMovieDto, upsertMovieSchema } from './dto/movie.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MoviesService } from './movies.service';
import { Response } from 'express';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          file.filename = Date.now() + '-' + file.originalname;
          cb(null, file.filename);
        },
      }),
    }),
  )
  async add(
    @Req() req,
    @Res() res: Response,
    @Body(new ZodValidationPipe(upsertMovieSchema)) body: UpsertMovieDto,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    const movie = await this.moviesService.add(body, poster, req.user.id);
    res.status(HttpStatus.OK).send({ movie, message: 'Movie added' });
  }

  @Put('update/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          file.filename = file.originalname;
          cb(null, file.filename);
        },
      }),
    }),
  )
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(upsertMovieSchema)) body: UpsertMovieDto,
    @UploadedFile() poster: Express.Multer.File,
  ) {
    const movie = await this.moviesService.update(id, body, poster);
    res.status(HttpStatus.OK).send({ movie, message: 'Movie updated' });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async get(@Res() res: Response, @Param('id') id: string) {
    const movie = await this.moviesService.getById(id);
    res.status(HttpStatus.OK).send({ movie, message: 'Movie fetched' });
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAll(
    @Res() res: Response,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const movies = await this.moviesService.getAll(page, limit);
    const total = await this.moviesService.getCount();
    if (movies.length === 0) {
      res
        .status(HttpStatus.OK)
        .send({ movies, total, message: 'No movies found' });
    } else {
      res
        .status(HttpStatus.OK)
        .send({ movies, total, message: 'Movies fetched' });
    }
  }
}
