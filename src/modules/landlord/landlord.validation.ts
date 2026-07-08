import { z } from "zod";

import { RentalStatus } from "../../../generated/prisma/enums";

const createLandlordPropertyFields = {
    categoryName: z
        .string({ error: "Category name must be a string" })
        .trim()
        .min(1, "Category name is required")
        .max(100, "Category name must not exceed 100 characters"),
    title: z
        .string({ error: "Title must be a string" })
        .trim()
        .min(1, "Title is required")
        .max(150, "Title must not exceed 150 characters"),
    description: z
        .string({ error: "Description must be a string" })
        .trim()
        .min(1, "Description is required")
        .max(5000, "Description must not exceed 5000 characters"),
    location: z
        .string({ error: "Location must be a string" })
        .trim()
        .min(1, "Location is required")
        .max(255, "Location must not exceed 255 characters"),
    price: z
        .number({ error: "Price must be a number" })
        .positive("Price must be greater than 0"),
    amenities: z
        .array(
            z
                .string({ error: "Amenity must be a string" })
                .trim()
                .min(1, "Amenity cannot be empty"),
        )
        .optional(),
    isAvailable: z.boolean({ error: "Availability must be a boolean" }).optional(),
};

const updateLandlordPropertyFields = {
    categoryId: z
        .string({ error: "Category ID must be a string" })
        .trim()
        .uuid("Category ID must be a valid UUID"),
    title: createLandlordPropertyFields.title,
    description: createLandlordPropertyFields.description,
    location: createLandlordPropertyFields.location,
    price: createLandlordPropertyFields.price,
    amenities: createLandlordPropertyFields.amenities,
    isAvailable: createLandlordPropertyFields.isAvailable,
};

export const createLandlordPropertyValidation = z.object(createLandlordPropertyFields).strict();

export const updateLandlordPropertyValidation = z
    .object(updateLandlordPropertyFields)
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one property field is required for update",
    })
    .strict();

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
