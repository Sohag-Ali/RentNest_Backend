import { Router } from "express";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { createUserValidation, updateUserValidation } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserValidation),
  userController.createUser
);

router.get("/me", authenticateUser(), userController.getMyProfile);
router.patch("/me", authenticateUser(), validateRequest(updateUserValidation), userController.updateMyProfile);

export const userRouter = router;