import { z } from "zod";

export const propertyOverviewValidation = z
  .object({
    address: z.string({ error: "Address must be a string" }).trim().min(1, "Address is required"),
    city: z.string({ error: "City must be a string" }).trim().min(1, "City is required"),
    state: z.string({ error: "State must be a string" }).trim().min(1, "State is required"),
    zipCode: z.string({ error: "Zip code must be a string" }).trim().min(1, "Zip code is required"),
    availableFrom: z
      .string({ error: "Available from date must be a string" })
      .trim()
      .min(1, "Available from date is required"),
    status: z.string({ error: "Status must be a string" }).trim().min(1, "Status is required"),
    yearBuilt: z
      .number({ error: "Year built must be a number" })
      .int("Year built must be an integer")
      .positive("Year built must be a positive number"),
    depositAmount: z
      .number({ error: "Deposit amount must be a number" })
      .nonnegative("Deposit amount must be non-negative"),
    leaseTerm: z
      .string({ error: "Lease term must be a string" })
      .trim()
      .min(1, "Lease term is required"),
    petPolicy: z
      .string({ error: "Pet policy must be a string" })
      .trim()
      .min(1, "Pet policy is required"),
    parkingType: z
      .string({ error: "Parking type must be a string" })
      .trim()
      .min(1, "Parking type is required"),
  })
  .strict();

export const createPropertyValidation = z
  .object({
    title: z.string({ error: "Title must be a string" }).trim().min(1, "Title is required"),
    slug: z.string({ error: "Slug must be a string" }).trim().min(1, "Slug is required"),
    description: z
      .string({ error: "Description must be a string" })
      .trim()
      .min(1, "Description is required"),
    detailedDescription: z
      .string({ error: "Detailed description must be a string" })
      .trim()
      .optional(),
    location: z
      .string({ error: "Location must be a string" })
      .trim()
      .min(1, "Location is required"),
    city: z.string({ error: "City must be a string" }).trim().min(1, "City is required"),
    state: z.string({ error: "State must be a string" }).trim().min(1, "State is required"),
    price: z
      .number({ error: "Price must be a number" })
      .positive("Price must be a positive number"),
    bedrooms: z
      .number({ error: "Bedrooms must be a number" })
      .int("Bedrooms must be an integer")
      .nonnegative("Bedrooms must be non-negative"),
    bathrooms: z
      .number({ error: "Bathrooms must be a number" })
      .nonnegative("Bathrooms must be non-negative"),
    areaSqFt: z
      .number({ error: "Area in sq ft must be a number" })
      .int("Area in sq ft must be an integer")
      .positive("Area in sq ft must be a positive number"),
    isFeatured: z.boolean({ error: "isFeatured must be a boolean" }).optional().default(false),
    isAvailable: z.boolean({ error: "isAvailable must be a boolean" }).optional().default(true),
    mainImage: z
      .string({ error: "Main image must be a string" })
      .trim()
      .min(1, "Main image is required"),
    images: z.array(z.string().trim().min(1, "Image URL cannot be empty")),
    amenities: z.array(z.string().trim().min(1, "Amenity cannot be empty")),
    categoryId: z
      .string({ error: "Category ID must be a string" })
      .trim()
      .min(1, "Category ID is required"),
    overview: propertyOverviewValidation.optional(),
  })
  .strict();

export const propertyQueryValidation = z
  .object({
    search: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    location: z.string().trim().optional(),
    category: z.string().trim().optional(),

    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),

    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().nonnegative().optional(),

    featured: z
      .preprocess(
        (val) =>
          val === "true" || val === true
            ? true
            : val === "false" || val === false
              ? false
              : val,
        z.boolean().optional()
      )
      .optional(),

    sort: z
      .enum(["newest", "price_asc", "price_desc", "rating"])
      .default("newest"),

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
