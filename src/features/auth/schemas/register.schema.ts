import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "One special character required"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type RegisterSchema = z.infer<typeof registerSchema>;