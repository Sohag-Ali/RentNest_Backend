import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import {
    confirmPaymentValidation,
    createPaymentValidation,
    paymentResourceIdValidation,
} from "./payment.validation";

const router = Router();

// 👇 এই দুইটা route কোনো auth ছাড়াই থাকবে, কারণ ব্রাউজার সরাসরি redirect করে
router.get("/success", paymentController.paymentSuccess);
router.get("/cancel", paymentController.paymentCancel);

// এখন থেকে বাকি সব route-এ auth লাগবে
router.use(authenticateUser(Role.TENANT));

router.post("/create", validateRequest(createPaymentValidation), paymentController.createPayment);
router.post("/confirm", validateRequest(confirmPaymentValidation), paymentController.confirmPayment);
router.get("/", paymentController.getMyPayments);
router.get("/:id", validateRequest(paymentResourceIdValidation, "params"), paymentController.getPaymentById);

export const paymentRouter = router;