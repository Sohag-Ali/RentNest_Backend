import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { googleLoginValidation, loginValidation } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(loginValidation), authController.loginUser);
router.post("/google", validateRequest(googleLoginValidation), authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export const authRouter = router;