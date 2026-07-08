import { z } from "zod";

export const createReviewValidation = z
    .object({
        rentalRequestId: z
            .string({ error: "Rental request ID must be a string" })
            .trim()
            .uuid("Rental request ID must be a valid UUID"),
        rating: z
            .number({ error: "Rating must be a number" })
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5"),
        comment: z
            .string({ error: "Comment must be a string" })
            .trim()
            .min(1, "Comment is required"),
    })
    .strict();
