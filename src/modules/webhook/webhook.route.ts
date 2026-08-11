import { Router } from "express";
import { webhookController } from "./webhook.controller";

const router = Router();

// POST /api/webhooks/stripe
// router.post("/stripe", webhookController.handleStripeWebhook);

export const webhookRouter = router;
