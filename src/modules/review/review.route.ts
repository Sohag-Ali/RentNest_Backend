import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewValidation } from "./review.validation";

const router = Router();

router.post(
    "/",
    authenticateUser(Role.TENANT),
    validateRequest(createReviewValidation),
    reviewController.createReview,
);

export const reviewRouter = router;
