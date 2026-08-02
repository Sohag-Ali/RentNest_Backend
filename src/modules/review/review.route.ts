import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { createReviewValidation, reviewIdValidation, updateReviewValidation } from "./review.validation";

const router = Router();

router.get("/me", authenticateUser(Role.TENANT), reviewController.getMyReviews);

router.patch(
    "/:id",
    authenticateUser(Role.TENANT),
    validateRequest(reviewIdValidation, "params"),
    validateRequest(updateReviewValidation),
    reviewController.updateMyReview,
);

router.delete(
    "/:id",
    authenticateUser(Role.TENANT),
    validateRequest(reviewIdValidation, "params"),
    reviewController.deleteMyReview,
);

router.post(
    "/",
    authenticateUser(Role.TENANT),
    validateRequest(createReviewValidation),
    reviewController.createReview,
);

export const reviewRouter = router;
