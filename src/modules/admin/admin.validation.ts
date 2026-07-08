import { z } from "zod";

import { Role, RentalStatus, UserStatus } from "../../../generated/prisma/enums";

const paginationFields = {
    page: z.coerce.number({ error: "Page must be a number" }).int().positive().default(1),
    limit: z.coerce.number({ error: "Limit must be a number" }).int().positive().max(100).default(10),
};

export const adminUsersQueryValidation = z
    .object({
        ...paginationFields,
        search: z.string({ error: "Search must be a string" }).trim().optional(),
        role: z.enum([Role.TENANT, Role.LANDLORD, Role.ADMIN]).optional(),
        status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BANNED]).optional(),
    })
    .strict();

export const adminUpdateUserStatusValidation = z
    .object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BANNED]),
    })
    .strict();

export const adminResourceIdValidation = z
    .object({
        id: z
            .string({ error: "ID must be a string" })
            .trim()
            .uuid("ID must be a valid UUID"),
    })
    .strict();

export const adminPropertiesQueryValidation = z
    .object({
        ...paginationFields,
        location: z.string({ error: "Location must be a string" }).trim().optional(),
        category: z.string({ error: "Category must be a string" }).trim().optional(),
        availability: z.coerce.boolean({ error: "Availability must be a boolean" }).optional(),
        sort: z.enum(["newest", "oldest", "price"]).default("newest"),
    })
    .strict();

export const adminRentalsQueryValidation = z
    .object({
        ...paginationFields,
        status: z.enum([
            RentalStatus.PENDING,
            RentalStatus.APPROVED,
            RentalStatus.REJECTED,
            RentalStatus.CANCELLED,
            RentalStatus.COMPLETED,
        ]).optional(),
    })
    .strict();
