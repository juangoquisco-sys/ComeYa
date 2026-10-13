import { z } from 'zod';

const normalizedEmail = z.string().trim().toLowerCase().email().max(320);

export const registerCustomerSchema = z.object({
  email: normalizedEmail,
  displayName: z.string().trim().min(2).max(80),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1).max(128),
});
