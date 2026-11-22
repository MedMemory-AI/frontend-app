import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit OTP sent to your email'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
