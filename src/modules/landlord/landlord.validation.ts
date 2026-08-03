import { z } from "zod";
import { PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { createPropertyValidation } from "../property/property.validation";

export const createLandlordPropertyValidation = createPropertyValidation;

export const updateLandlordPropertyValidation = createPropertyValidation
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one property field is required for update",
  });

export const landlordResourceIdValidation = z
  .object({
    id: z
      .string({ error: "ID must be a string" })
      .trim()
      .uuid("ID must be a valid UUID"),
  })
  .strict();

export const updateRentalRequestStatusValidation = z
  .object({
    status: z.enum([RentalStatus.APPROVED, RentalStatus.REJECTED], {
      error: "Status must be APPROVED or REJECTED",
    }),
  })
  .strict();

export const landlordRentedPropertiesQueryValidation = z
  .object({
    search: z.string({ error: "Search must be a string" }).trim().optional(),
    city: z.string({ error: "City must be a string" }).trim().optional(),
    category: z.string({ error: "Category must be a string" }).trim().optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    sort: z
      .preprocess((value) => {
        if (value === "paid_date_desc") {
          return "paidDateDesc";
        }

        return value;
      }, z.enum(["newest", "paidDateDesc"]).default("newest")),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .strict();
