import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Email not registered');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { accessToken, refreshToken } = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    const userData = await this.usersService.getUserProfile(user.id);
    return { accessToken, refreshToken, user: userData };
  }

  async logout(userId: number) {
    await this.usersService.updateTokenVersion(userId);
    await this.usersService.updateRefreshToken(userId, '');
  }

  async refreshToken(oldRefreshToken: string) {
    const verified = await this.jwtService.verify(oldRefreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    if (!verified) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const user = await this.usersService.getUserById(verified.id);
    if (!user || oldRefreshToken != user.refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const updatedUser = await this.usersService.updateTokenVersion(user.id);
    const { accessToken, refreshToken } =
      await this.generateTokens(updatedUser);
    await this.usersService.updateRefreshToken(verified.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async generateTokens(user: any) {
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
        isVerified: user.isVerified,
        tokenVersion: user.tokenVersion,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { id: user.id, tokenVersion: user.tokenVersion },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );
    return { accessToken, refreshToken };
  }
}
