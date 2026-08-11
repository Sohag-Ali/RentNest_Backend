import { z } from "zod";

export const addToWishlistValidation = z
  .object({
    propertyId: z
      .string({ error: "Property ID must be a string" })
      .trim()
      .uuid("Property ID must be a valid UUID"),
  })
  .strict();

export const propertyIdParamValidation = z
  .object({
    propertyId: z
      .string({ error: "Property ID must be a string" })
      .trim()
      .uuid("Property ID must be a valid UUID"),
  })
  .strict();
