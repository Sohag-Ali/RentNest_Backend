import { z } from "zod";

export const createRentalRequestValidation = z
    .object({
        propertyId: z
            .string({ error: "Property ID must be a string" })
            .trim()
            .uuid("Property ID must be a valid UUID"),
        moveInDate: z.coerce.date().optional(),
    })
    .strict();

export const rentalResourceIdValidation = z
    .object({
        id: z
            .string({ error: "Rental request ID must be a string" })
            .trim()
            .uuid("Rental request ID must be a valid UUID"),
    })
    .strict();
