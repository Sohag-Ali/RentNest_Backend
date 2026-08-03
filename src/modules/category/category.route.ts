import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { createCategoryValidation } from "./category.validation";

const router = Router();

router.get("/", categoryController.getCategories);

router.post(
    "/",
    authenticateUser(Role.ADMIN),
    validateRequest(createCategoryValidation),
    categoryController.createCategory,
);

export const categoriesRouter = router;
