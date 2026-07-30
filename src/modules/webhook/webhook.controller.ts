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
    console.log(`[DEBUG 1 & 19] Webhook route hit: ${req.method} ${req.originalUrl}`);

    const signature = req.headers["stripe-signature"];
    console.log(`[DEBUG 2] Stripe Signature Header present: ${!!signature}`);

    if (!signature) {
        console.error("❌ [DEBUG 2 FAIL] Stripe signature missing from headers");
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "Stripe signature missing from headers",
        });
    }

    console.log(`[DEBUG 3] Body type: ${typeof req.body}, Is Buffer: ${Buffer.isBuffer(req.body)}, Length: ${Buffer.isBuffer(req.body) ? req.body.length : "N/A"}`);

    if (!Buffer.isBuffer(req.body)) {
        console.error("❌ [DEBUG 3 FAIL] req.body is NOT a Buffer! express.raw() might have failed or express.json() interfered.");
    }

    let event: Stripe.Event;

    try {
        console.log(`[DEBUG 4 & 5] Verifying signature with stripe.webhooks.constructEvent...`);
        console.log(`[DEBUG 5 Secret Check] Configured webhook secret: ${config.stripe_webhook_secret ? config.stripe_webhook_secret.substring(0, 10) + "..." : "MISSING!"}`);
        
        event = stripe.webhooks.constructEvent(
            req.body,
            signature as string,
            config.stripe_webhook_secret
        );
        console.log("✅ [DEBUG 5 SUCCESS] Signature verified successfully!");
    } catch (err: any) {
        console.error(`❌ [DEBUG 5 FAIL] Signature verification failed!`);
        console.error(`Reason: ${err.message}`);
        console.error(`Stack trace:\n${err.stack}`);
        console.log("========== STRIPE WEBHOOK END (FAILED) ==========\n");
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: `Webhook Signature Verification Failed: ${err.message}`,
        });
    }

    console.log(`[DEBUG 6] Event type received: ${event.type}`);

    // Filter and handle ONLY checkout.session.completed event; ignore all other events
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[DEBUG 11 & 15] Calling webhookService.processCheckoutSessionCompleted for Session ID: ${session.id}...`);

        try {
            await webhookService.processCheckoutSessionCompleted(session);
            console.log("✅ [DEBUG 12 SUCCESS] Service processing completed successfully!");
        } catch (error: any) {
            console.error(`❌ [DEBUG 13, 14, 20 FAIL] Failed processing checkout.session.completed!`);
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
        console.log(`[Stripe Webhook] Received unhandled event type: ${event.type}. Ignoring.`);
    }

    console.log(`[DEBUG 7] Returning HTTP 200 OK to Stripe`);
    console.log("========== STRIPE WEBHOOK END ==========\n");
    return res.status(httpStatus.OK).json({ received: true });
};

export const webhookController = {
    handleStripeWebhook,
};
