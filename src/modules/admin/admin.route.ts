import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import {
    adminPropertiesQueryValidation,
    adminRentalsQueryValidation,
    adminResourceIdValidation,
    adminUpdateUserStatusValidation,
    adminUsersQueryValidation,
} from "./admin.validation";

const router = Router();

// router.use(authenticateUser(Role.ADMIN));

router.get("/users",
    authenticateUser(Role.ADMIN),
     validateRequest(adminUsersQueryValidation, "query"), adminController.getUsers);

router.patch(
    "/users/:id",
    authenticateUser(Role.ADMIN),
    validateRequest(adminResourceIdValidation, "params"),
    validateRequest(adminUpdateUserStatusValidation),
    adminController.updateUserStatus,
);

router.get(
    "/properties",
    authenticateUser(Role.ADMIN),
    validateRequest(adminPropertiesQueryValidation, "query"),
    adminController.getProperties,
);

router.get(
    "/rentals",
    authenticateUser(Role.ADMIN),
    validateRequest(adminRentalsQueryValidation, "query"),
    adminController.getRentals,
);

export const adminRouter = router;
