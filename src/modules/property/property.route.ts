import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyController } from "./property.controller";
import {
  createPropertyValidation,
  propertyIdValidation,
  propertyQueryValidation,
} from "./property.validation";

const router = Router();

router.get("/featured", propertyController.getFeaturedProperties);

router.get("/", validateRequest(propertyQueryValidation, "query"), propertyController.getProperties);

router.post(
  "/",
  authenticateUser(Role.LANDLORD),
  validateRequest(createPropertyValidation),
  propertyController.createProperty
);

router.get(
  "/:id",
  validateRequest(propertyIdValidation, "params"),
  propertyController.getPropertyById,
);

export const propertyRouter = router;
