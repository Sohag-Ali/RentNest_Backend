import { z } from "zod";

export const createCategoryValidation = z.object({
    name: z.string()
        .trim()
        .min(1, "Category name is required")
        .max(100, "Category name must be at most 100 characters"),
});
