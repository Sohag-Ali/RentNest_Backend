import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { createRentalRequestValidation, rentalResourceIdValidation } from "./rental.validation";

const router = Router();

// router.use(authenticateUser(Role.TENANT));

router.post(
    "/",
    authenticateUser(Role.TENANT),
    validateRequest(createRentalRequestValidation),
    rentalController.createRentalRequest,
);

router.get("/", authenticateUser(Role.TENANT), rentalController.getMyRentalRequests);

router.get(
    "/:id",
    authenticateUser(Role.TENANT),
    validateRequest(rentalResourceIdValidation, "params"),
    rentalController.getRentalRequestById,
);

export const rentalRouter = router;
