import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  loginSchema,
  RefreshTokenDto,
  refreshTokenSchema,
} from './dto/auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Res() res: Response,
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      body.email,
      body.password,
    );
    res.status(HttpStatus.OK).send({ accessToken, refreshToken, user });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req, @Res() res: Response) {
    await this.authService.logout(req.user.id);
    res.status(HttpStatus.OK).send({ message: 'Logged out' });
  }

  @Post('refresh-token')
  async refreshToken(
    @Res() res: Response,
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      body.oldRefreshToken,
    );
    res.status(HttpStatus.OK).send({ accessToken, refreshToken });
  }
}
