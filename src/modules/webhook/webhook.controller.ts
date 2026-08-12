import type { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import { stripe } from "../payment/payment.constant";
import { webhookService } from "./webhook.service";

/**
 * Controller to handle incoming Stripe Webhook events.
 * Signature verification is performed using the unparsed raw request body Buffer.
 */
const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log("\n========== STRIPE WEBHOOK START ==========");
    console.log(`[WEBHOOK] route reached: ${req.method} ${req.originalUrl}`);

    const signature = req.headers["stripe-signature"];

    if (!signature) {
        console.error("❌ [WEBHOOK] Stripe signature missing from headers");
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "Stripe signature missing from headers",
        });
    }
    console.log("[WEBHOOK] signature exists");

    if (!Buffer.isBuffer(req.body)) {
        console.error("❌ [WEBHOOK] req.body is NOT a Buffer! express.raw() might have failed or express.json() interfered.");
    } else {
        console.log("[WEBHOOK] body is Buffer");
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"]!,
            config.stripe_webhook_secret
        );
        console.log("[WEBHOOK] signature verified");
    } catch (err: any) {
        console.error(`❌ [WEBHOOK] Signature verification failed!`);
        console.error(`Reason: ${err.message}`);
        console.error(`Stack trace:\n${err.stack}`);
        console.log("========== STRIPE WEBHOOK END (FAILED) ==========\n");
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: `Webhook Signature Verification Failed: ${err.message}`,
        });
    }

    console.log(`[WEBHOOK] event type: ${event.type}`);

    // Filter and handle ONLY checkout.session.completed event; ignore all other events
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            await webhookService.processCheckoutSessionCompleted(session);
        } catch (error: any) {
            console.error(`❌ [WEBHOOK] Failed processing checkout.session.completed!`);
            console.error(`Reason: ${error.message}`);
            console.error(`Stack trace:\n${error.stack}`);
            console.log("========== STRIPE WEBHOOK END (ERROR) ==========\n");
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Internal server error processing Stripe webhook",
                error: error.message,
            });
        }
    } else {
        console.log(`[WEBHOOK] Ignoring event type: ${event.type}`);
    }

    console.log("[WEBHOOK] returning 200");
    console.log("========== STRIPE WEBHOOK END ==========\n");
    return res.status(httpStatus.OK).json({ received: true });
};

export const webhookController = {
    handleStripeWebhook,
};
