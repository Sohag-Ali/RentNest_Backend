import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticateUser } from "../../middlewares/authenticateUser";

import { createUserValidation } from "./user.validation";


const router = Router();

router.post(
    "/register",
    validateRequest(createUserValidation),
    userController.createUser,
);

router.get("/me", authenticateUser(), userController.getMyProfile);

export const userRouter = router;