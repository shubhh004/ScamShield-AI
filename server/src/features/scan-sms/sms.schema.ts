import { z } from 'zod';

export const smsScanInputSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .min(5, 'Message must be at least 5 characters')
    .max(1600, 'Message must be at most 1,600 characters')
    .trim(),
});

export type SmsScanInput = z.infer<typeof smsScanInputSchema>;
