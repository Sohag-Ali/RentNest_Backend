import { z } from "zod";

export const propertyQueryValidation = z
    .object({
        location: z.string().trim().optional(),
        category: z.string().trim().optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        maxPrice: z.coerce.number().nonnegative().optional(),
        sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(10),
    })
    .strict();

export const propertyIdValidation = z
    .object({
        id: z
            .string({ error: "Property ID must be a string" })
            .trim()
            .uuid("Property ID must be a valid UUID"),
    })
    .strict();
