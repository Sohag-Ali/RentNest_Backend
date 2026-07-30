import { z } from "zod";

export const loginValidation = z
  .object({
    email: z
      .string({ error: "Email must be a string" })
      .trim()
      .email("Email must be a valid email address"),
    password: z
      .string({ error: "Password must be a string" })
      .min(1, "Password is required"),
  })
  .strict();
