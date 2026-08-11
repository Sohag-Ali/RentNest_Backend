import { PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { PAYMENT_PROVIDER, stripe } from "./payment.constant";

type CreatePaymentInput = {
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
                    slug: true,
                    mainImage: true,
                    location: true,
                    city: true,
                    state: true,
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

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "bdt",
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
        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&rentalRequestId=${payload.rentalRequestId}`,
        cancel_url: `${config.app_url}/payment/cancel`,
    });

    return {
        url: session.url,
        sessionId: session.id,
    };
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

const getPaymentByRentalRequestIdFromDB = async (tenantId: string, rentalRequestId: string) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: rentalRequestId,
            tenantId,
        },
        select: {
            id: true,
        },
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    const payment = await prisma.payment.findUnique({
        where: {
            rentalRequestId,
        },
        select: {
            id: true,
            rentalRequestId: true,
            transactionId: true,
            amount: true,
            provider: true,
            status: true,
            paidAt: true,
            createdAt: true,
        },
    });

    if (!payment) {
        return null;
    }

    return payment;
};

export const paymentService = {
    createPaymentIntentIntoDB,
    getMyPaymentsFromDB,
    getPaymentByIdFromDB,
    getPaymentByRentalRequestIdFromDB,
};

