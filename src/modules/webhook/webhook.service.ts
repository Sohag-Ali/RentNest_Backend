import Stripe from "stripe";
import { NotificationType, PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { createNotification } from "../notification/notification.service";

/**
 * Handles processing of Stripe checkout.session.completed webhook events.
 * Ensures idempotency, verifies payment completion, and updates database records inside a Prisma transaction.
 */
const processCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    // 1. Verify Stripe payment status
    if (session.payment_status !== "paid") {
        console.log(`[WEBHOOK] Session ${session.id} payment_status is '${session.payment_status}'. Skipping processing.`);
        return null;
    }

    // 2. Extract metadata populated when session was created
    const tenantId = session.metadata?.tenantId;
    const rentalRequestId = session.metadata?.rentalRequestId;

    console.log(`[WEBHOOK] tenantId: ${tenantId}`);
    console.log(`[WEBHOOK] rentalRequestId: ${rentalRequestId}`);

    if (!tenantId || !rentalRequestId) {
        console.error("❌ [WEBHOOK] Missing required metadata (tenantId, rentalRequestId) in Stripe session!");
        throw new AppError(
            400,
            "Missing required metadata (tenantId, rentalRequestId) in Stripe Checkout session"
        );
    }

    // 3. Idempotency Check: Prevent duplicate payment processing if event is delivered multiple times
    const transactionId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id || session.id;

    console.log(`[WEBHOOK] existing payment check (rentalRequestId: ${rentalRequestId}, transactionId: ${transactionId})`);
    const existingPayment = await prisma.payment.findFirst({
        where: {
            OR: [
                { rentalRequestId },
                { transactionId },
            ],
        },
    });

    if (existingPayment) {
        console.log(`[WEBHOOK] existing payment found (ID: ${existingPayment.id}). Skipping creation.`);
        
        // Ensure notification is present even if retried
        await createNotification({
            userId: tenantId,
            type: NotificationType.PAYMENT_SUCCESS,
            title: "Payment Successful",
            message: `Your payment of ৳${existingPayment.amount} for your rental request was successfully processed.`,
            entityId: existingPayment.id,
            entityType: "Payment",
        });

        return existingPayment;
    }

    // 4. Fetch associated rental request to verify existence and retrieve property pricing
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: rentalRequestId,
            tenantId,
        },
        select: {
            id: true,
            status: true,
            property: {
                select: {
                    price: true,
                },
            },
        },
    });

    if (!rentalRequest) {
        console.error(`❌ [WEBHOOK] Rental request '${rentalRequestId}' not found for tenant '${tenantId}'`);
        throw new AppError(
            404,
            `Rental request with ID '${rentalRequestId}' not found for tenant '${tenantId}'`
        );
    }
    console.log(`[WEBHOOK] rental request found (id: ${rentalRequest.id}, price: ${rentalRequest.property.price})`);

    // 5. Calculate transaction amount
    const amount = session.amount_total
        ? session.amount_total / 100
        : rentalRequest.property.price;

    // 6. Execute atomic Prisma transaction
    const payment = await prisma.$transaction(async (tx) => {
        // Re-check existing payment inside transaction to handle concurrent webhook deliveries
        const recheckPayment = await tx.payment.findFirst({
            where: {
                OR: [
                    { rentalRequestId },
                    { transactionId },
                ],
            },
        });

        if (recheckPayment) {
            console.log("[WEBHOOK] existing payment found inside transaction. Concurrent execution prevented.");
            return recheckPayment;
        }

        const createdPayment = await tx.payment.create({
            data: {
                rentalRequestId,
                userId: tenantId,
                transactionId,
                amount,
                provider: PaymentProvider.STRIPE,
                status: PaymentStatus.COMPLETED,
                paidAt: new Date(),
            },
        });
        console.log(`[WEBHOOK] payment created (ID: ${createdPayment.id}, amount: ${amount})`);

        await tx.rentalRequest.update({
            where: { id: rentalRequestId },
            data: { status: RentalStatus.COMPLETED },
        });
        console.log(`[WEBHOOK] rental status updated to COMPLETED (id: ${rentalRequestId})`);

        return createdPayment;
    });

    // Create PAYMENT_SUCCESS notification
    await createNotification({
        userId: tenantId,
        type: NotificationType.PAYMENT_SUCCESS,
        title: "Payment Successful",
        message: `Your payment of ৳${payment.amount} for your rental request was successfully processed.`,
        entityId: payment.id,
        entityType: "Payment",
    });

    return payment;
};

export const webhookService = {
    processCheckoutSessionCompleted,
};
