import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { landlordController } from "./landlord.controller";
import {
    createLandlordPropertyValidation,
    landlordResourceIdValidation,
    updateLandlordPropertyValidation,
    updateRentalRequestStatusValidation,
} from "./landlord.validation";

const router = Router();

// router.use(authenticateUser(Role.LANDLORD));

router.post(
    "/properties",
    authenticateUser(Role.LANDLORD),
    validateRequest(createLandlordPropertyValidation),
    landlordController.createProperty,
);

router.put(
    "/properties/:id",
    authenticateUser(Role.LANDLORD),
    validateRequest(landlordResourceIdValidation, "params"),
    validateRequest(updateLandlordPropertyValidation),
    landlordController.updateProperty,
);

router.delete(
    "/properties/:id",
    authenticateUser(Role.LANDLORD),
    validateRequest(landlordResourceIdValidation, "params"),
    landlordController.deleteProperty,
);

router.get("/requests",
    authenticateUser(Role.LANDLORD),
    landlordController.getLandlordRequests);

router.patch(
    "/requests/:id",
    authenticateUser(Role.LANDLORD),
    validateRequest(landlordResourceIdValidation, "params"),
    validateRequest(updateRentalRequestStatusValidation),
    landlordController.updateRentalRequestStatus,
);

export const landlordRouter = router;
