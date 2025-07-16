import { z } from 'zod';

export const upsertMovieSchema = z.object({
  title: z.string().min(3).optional(),
  publishedYear: z.string().optional(),
});
export type UpsertMovieDto = z.infer<typeof upsertMovieSchema>;
