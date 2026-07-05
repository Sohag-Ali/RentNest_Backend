import { z } from "zod";

import { Role } from "../../../generated/prisma/enums";

export const createUserValidation = z.object({
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
        .string()
        .regex(/^01[3-9]\d{8}$/, "Invalid phone number")
        .optional(),
    role: z.enum([Role.TENANT, Role.LANDLORD], {
        error: "Role must be one of TENANT or LANDLORD",
    }),
}).strict();
