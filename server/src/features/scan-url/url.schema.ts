import { z } from 'zod';

export const scanUrlInputSchema = z.object({
  url: z
    .string({ required_error: 'URL is required' })
    .trim()
    .min(1, 'URL is required')
    .max(2048, 'URL must be at most 2048 characters')
    .url('Must be a valid URL')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL must use http or https scheme',
    ),
});

export type ScanUrlInput = z.infer<typeof scanUrlInputSchema>;
