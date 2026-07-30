import Stripe from "stripe";
import { PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

/**
 * Handles processing of Stripe checkout.session.completed webhook events.
 * Ensures idempotency, verifies payment completion, and updates database records inside a Prisma transaction.
 */
const processCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    console.log("  ---> [SERVICE START] processCheckoutSessionCompleted execution begun");

    // 1. Verify Stripe payment status
    console.log(`  ---> [DEBUG 9] Checking session payment_status: '${session.payment_status}'`);
    if (session.payment_status !== "paid") {
        console.log(`  ---> [DEBUG 9 SKIP] Session ${session.id} payment_status is '${session.payment_status}'. Skipping processing.`);
        return null;
    }

    // 2. Extract metadata populated when session was created
    const tenantId = session.metadata?.tenantId;
    const rentalRequestId = session.metadata?.rentalRequestId;
    console.log(`  ---> [DEBUG 8] Metadata extracted: tenantId=${tenantId}, rentalRequestId=${rentalRequestId}`);

    if (!tenantId || !rentalRequestId) {
        console.error("  ---> ❌ [DEBUG 8 FAIL] Missing required metadata (tenantId, rentalRequestId) in Stripe session!");
        throw new AppError(
            400,
            "Missing required metadata (tenantId, rentalRequestId) in Stripe Checkout session"
        );
    }

    // 3. Idempotency Check: Prevent duplicate payment processing if event is delivered multiple times
    console.log(`  ---> [DEBUG 16] Checking for existing Payment record for rentalRequestId: ${rentalRequestId}`);
    const existingPayment = await prisma.payment.findUnique({
        where: { rentalRequestId },
    });

    if (existingPayment) {
        console.log(
            `  ---> [DEBUG 16 STOP] Idempotent execution: Payment already exists (ID: ${existingPayment.id}) for rentalRequestId ${rentalRequestId}. Skipping creation.`
        );
        return existingPayment;
    }

    // 4. Fetch associated rental request to verify existence and retrieve property pricing
    console.log(`  ---> [SERVICE] Fetching RentalRequest (id: ${rentalRequestId}, tenantId: ${tenantId}) from DB...`);
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
        console.error(`  ---> ❌ [SERVICE FAIL] Rental request '${rentalRequestId}' not found for tenant '${tenantId}'`);
        throw new AppError(
            404,
            `Rental request with ID '${rentalRequestId}' not found for tenant '${tenantId}'`
        );
    }
    console.log(`  ---> [SERVICE] Found RentalRequest. Current status: ${rentalRequest.status}, Property price: ${rentalRequest.property.price}`);

    // 5. Calculate transaction amount
    const amount = session.amount_total
        ? session.amount_total / 100
        : rentalRequest.property.price;
    const transactionId = (session.payment_intent as string) || session.id;
    console.log(`  ---> [DEBUG 10] Transaction ID: ${transactionId}, Amount: ${amount}`);

    // 6. Execute atomic Prisma transaction
    console.log("  ---> [DEBUG 12] Executing Prisma transaction ($transaction)...");
    const payment = await prisma.$transaction(async (tx) => {
        // Re-check existing payment inside transaction to handle concurrent webhook deliveries
        const recheckPayment = await tx.payment.findUnique({
            where: { rentalRequestId },
        });

        if (recheckPayment) {
            console.log("  ---> [DEBUG 16 INSIDE TX] Concurrent execution prevented. Payment already created.");
            return recheckPayment;
        }

        console.log("  ---> [DEBUG 12a] Creating Payment record in DB...");
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
        console.log(`  ---> [DEBUG 12a SUCCESS] Payment created successfully (ID: ${createdPayment.id})`);

        console.log("  ---> [DEBUG 12b] Updating RentalRequest status to COMPLETED...");
        await tx.rentalRequest.update({
            where: { id: rentalRequestId },
            data: { status: RentalStatus.COMPLETED },
        });
        console.log("  ---> [DEBUG 12b SUCCESS] RentalRequest status updated to COMPLETED!");

        return createdPayment;
    });

    console.log(
        `  ---> ✅ [SERVICE COMPLETE] Payment confirmed & RentalRequest ${rentalRequestId} set to COMPLETED successfully.`
    );

    return payment;
};

export const webhookService = {
    processCheckoutSessionCompleted,
};
