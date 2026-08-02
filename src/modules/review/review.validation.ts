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

export const updateReviewValidation = z
    .object({
        rating: z
            .number({ error: "Rating must be a number" })
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
        comment: z
            .string({ error: "Comment must be a string" })
            .trim()
            .min(1, "Comment is required")
            .optional(),
    })
    .strict()
    .refine((data) => data.rating !== undefined || data.comment !== undefined, {
        message: "At least one field is required to update a review",
    });

export const reviewIdValidation = z
    .object({
        id: z
            .string({ error: "Review ID must be a string" })
            .trim()
            .uuid("Review ID must be a valid UUID"),
    })
    .strict();
