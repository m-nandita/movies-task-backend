import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  oldRefreshToken: z.string(),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
