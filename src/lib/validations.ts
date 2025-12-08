// Zod schemas for API input validation
import { z } from 'zod';

// Year validation (reasonable range for the app)
const yearSchema = z
  .number()
  .int()
  .min(2020)
  .max(2030)
  .default(2025);

// Stats refresh request
export const statsRefreshSchema = z.object({
  year: yearSchema,
});

export type StatsRefreshInput = z.infer<typeof statsRefreshSchema>;

// Settings update request
export const settingsUpdateSchema = z.object({
  year: yearSchema,
  publicProfileEnabled: z.boolean().optional(),
  includePrivateRepos: z.boolean().optional(),
  themeVariant: z
    .enum(['nebula-blue', 'supernova-violet', 'dark-matter'])
    .optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

// Query params validation
export const yearQuerySchema = z.object({
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 2025))
    .refine((n) => n >= 2020 && n <= 2030 && Number.isInteger(n), {
      message: 'Year must be an integer between 2020 and 2030',
    }),
});

// Username validation (GitHub username rules)
export const usernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: 'Invalid GitHub username format',
  });

// Validate and parse with error handling
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
  return { success: false, error: errorMessage };
}
