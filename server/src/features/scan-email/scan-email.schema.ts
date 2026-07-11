import { z } from 'zod';

export const scanEmailInputSchema = z.object({
  subject: z.string().trim().max(998, 'Subject must be at most 998 characters').optional(),
  sender: z
    .string({ required_error: 'Sender email is required' })
    .email('Must be a valid email address')
    .trim()
    .toLowerCase(),
  body: z
    .string({ required_error: 'Email body is required' })
    .min(1, 'Email body is required')
    .max(10000, 'Body must be at most 10,000 characters')
    .trim(),
});

export type ScanEmailInput = z.infer<typeof scanEmailInputSchema>;
