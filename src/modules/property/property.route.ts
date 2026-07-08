import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import { propertyIdValidation, propertyQueryValidation } from "./property.validation";

const router = Router();

router.get("/", validateRequest(propertyQueryValidation, "query"), propertyController.getProperties);

router.get(
    "/:id",
    validateRequest(propertyIdValidation, "params"),
    propertyController.getPropertyById,
);

export const propertyRouter = router;
