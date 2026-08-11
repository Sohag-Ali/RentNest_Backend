import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { wishlistController } from "./wishlist.controller";
import { addToWishlistValidation, propertyIdParamValidation } from "./wishlist.validation";

const router = Router();

// Protect all wishlist routes for TENANT (and ADMIN)
router.use(authenticateUser(Role.TENANT, Role.ADMIN));

router.post(
  "/",
  validateRequest(addToWishlistValidation),
  wishlistController.addToWishlist
);

router.post(
  "/toggle",
  validateRequest(addToWishlistValidation),
  wishlistController.toggleWishlist
);

router.get(
  "/",
  wishlistController.getMyWishlist
);

router.get(
  "/check/:propertyId",
  validateRequest(propertyIdParamValidation, "params"),
  wishlistController.checkWishlistStatus
);

router.delete(
  "/:propertyId",
  validateRequest(propertyIdParamValidation, "params"),
  wishlistController.removeFromWishlist
);

export const wishlistRouter = router;
