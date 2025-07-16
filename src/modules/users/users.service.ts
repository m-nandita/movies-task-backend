import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  async getUserProfile(id: number) {
    return await this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        username: true,
      },
    });
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    return await this.prisma.user.update({
      where: { id: Number(id) },
      data: { refreshToken },
    });
  }

  async updateTokenVersion(id: number) {
    return await this.prisma.user.update({
      where: { id: Number(id) },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
