import { z } from "zod";
import { Gender, Role } from "../../../generated/prisma/client";

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .nullable();

export const createUserValidation = z
  .object({
    name: z
      .string({ error: "Name must be a string" })
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    email: z
      .string({ error: "Email must be a string" })
      .trim()
      .email("Email must be a valid email address"),
    password: z
      .string({ error: "Password must be a string" })
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must not exceed 128 characters"),
    phone: z
      .string({ error: "Phone must be a string" })
      .trim()
      .optional()
      .nullable(),
    role: z.enum([Role.TENANT, Role.LANDLORD], {
      error: "Role must be one of TENANT or LANDLORD",
    }),
  })
  .strict();

export const updateUserValidation = z
  .object({
    avatar: optionalUrl,
    phone: z.string().trim().optional().nullable(),
    bio: z
      .string()
      .trim()
      .max(500, "Bio must not exceed 500 characters")
      .optional()
      .nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    dateOfBirth: z.coerce.date().optional().nullable(),
    occupation: z
      .string()
      .trim()
      .max(100, "Occupation must not exceed 100 characters")
      .optional()
      .nullable(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    zipCode: z.string().trim().optional().nullable(),
    website: optionalUrl,
    github: optionalUrl,
    linkedin: optionalUrl,
    facebook: optionalUrl,
  })
  .strict();
