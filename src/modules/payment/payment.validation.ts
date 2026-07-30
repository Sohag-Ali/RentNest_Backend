import { z } from "zod";

export const createPaymentValidation = z
    .object({
        rentalRequestId: z
            .string({ error: "Rental request ID must be a string" })
            .trim()
            .uuid("Rental request ID must be a valid UUID"),
    })
    .strict();

export const paymentResourceIdValidation = z
    .object({
        id: z
            .string({ error: "Payment ID must be a string" })
            .trim()
            .uuid("Payment ID must be a valid UUID"),
    })
    .strict();
