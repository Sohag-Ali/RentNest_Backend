import { z } from "zod";
import { RentalStatus } from "../../../generated/prisma/enums";
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
