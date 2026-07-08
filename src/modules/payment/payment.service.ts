import { PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { PAYMENT_PROVIDER, stripe } from "./payment.constant";

type CreatePaymentInput = {
    rentalRequestId: string;
};

type ConfirmPaymentInput = {
    sessionId: string;
    rentalRequestId: string;
};


const paymentHistorySelect = {
    id: true,
    rentalRequestId: true,
    userId: true,
    transactionId: true,
    amount: true,
    provider: true,
    status: true,
    paidAt: true,
    createdAt: true,
    rentalRequest: {
        select: {
            id: true,
            status: true,
            moveInDate: true,
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
} as const;

const paymentDetailsSelect = {
    id: true,
    rentalRequestId: true,
    userId: true,
    transactionId: true,
    amount: true,
    provider: true,
    status: true,
    paidAt: true,
    createdAt: true,
    rentalRequest: {
        select: {
            id: true,
            status: true,
            moveInDate: true,
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    price: true,
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
} as const;

const createPaymentIntentIntoDB = async (tenantId: string, payload: CreatePaymentInput) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: payload.rentalRequestId,
            tenantId,
        },
        select: {
            id: true,
            tenantId: true,
            status: true,
            property: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    landlordId: true,
                    isAvailable: true,
                },
            },
        },
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    if (rentalRequest.status !== RentalStatus.APPROVED) {
        throw new AppError(400, "Only approved rental requests can be paid for");
    }

    const existingPayment = await prisma.payment.findUnique({
        where: { rentalRequestId: payload.rentalRequestId },
        select: { id: true },
    });

    if (existingPayment) {
        throw new AppError(409, "Payment already exists for this rental request");
    }

    const amount = Math.round(rentalRequest.property.price * 100);

    // 👇 Checkout Session instead of raw PaymentIntent
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: rentalRequest.property.title,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            },
        ],
        metadata: {
            rentalRequestId: payload.rentalRequestId,
            tenantId,
        },
        success_url: "http://localhost:5000/api/payments/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:5000/api/payments/cancel",
    });

    return {
        url: session.url,        // 👈 এটাই ব্রাউজারে খুলবেন
        sessionId: session.id,   // 👈 confirm করার সময় এটা লাগবে
    };
};


const confirmPaymentIntoDB = async (tenantId: string, payload: ConfirmPaymentInput) => {
    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);

    if (session.payment_status !== "paid") {
        throw new AppError(400, "Payment has not been completed successfully");
    }

    if (session.metadata?.rentalRequestId !== payload.rentalRequestId) {
        throw new AppError(400, "Session does not match the rental request");
    }

    if (session.metadata?.tenantId !== tenantId) {
        throw new AppError(403, "You are not allowed to confirm this payment");
    }

    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: { id: payload.rentalRequestId, tenantId },
        select: { id: true, property: { select: { price: true } } },
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    const payment = await prisma.$transaction(async (transaction) => {
        const createdPayment = await transaction.payment.create({
            data: {
                rentalRequestId: payload.rentalRequestId,
                userId: tenantId,
                transactionId: session.payment_intent as string,
                amount: rentalRequest.property.price,
                provider: PaymentProvider.STRIPE,
                status: PaymentStatus.COMPLETED,
                paidAt: new Date(),
            },
            select: paymentDetailsSelect,
        });

        await transaction.rentalRequest.update({
            where: { id: payload.rentalRequestId },
            data: { status: RentalStatus.COMPLETED },
        });

        return createdPayment;
    });

    return payment;
};

const getMyPaymentsFromDB = async (tenantId: string) => {
    return prisma.payment.findMany({
        where: {
            userId: tenantId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: paymentHistorySelect,
    });
};

const getPaymentByIdFromDB = async (tenantId: string, paymentId: string) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            userId: tenantId,
        },
        select: paymentDetailsSelect,
    });

    if (!payment) {
        throw new AppError(404, "Payment not found");
    }

    return payment;
};

export const paymentService = {
    createPaymentIntentIntoDB,
    confirmPaymentIntoDB,
    getMyPaymentsFromDB,
    getPaymentByIdFromDB,
};
