import { Prisma } from "../../../generated/prisma/client";
import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateReview, IUpdateReview } from "./review.interface";

const reviewSelect = {
    id: true,
    tenantId: true,
    propertyId: true,
    rentalRequestId: true,
    rating: true,
    comment: true,
    createdAt: true,
    tenant: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    property: {
        select: {
            id: true,
            title: true,
            location: true,
            slug: true,
            city: true,
            state: true,
            price: true,
            mainImage: true,
            isAvailable: true,
            rating: true,
            reviewCount: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

const recalculatePropertyReviewStats = async (transaction: Prisma.TransactionClient, propertyId: string) => {
    const aggregate = await transaction.review.aggregate({
        where: {
            propertyId,
        },
        _avg: {
            rating: true,
        },
        _count: {
            id: true,
        },
    });

    await transaction.property.update({
        where: {
            id: propertyId,
        },
        data: {
            rating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count.id,
        },
    });
};

const createReviewIntoDB = async (tenantId: string, payload: ICreateReview) => {
    const { rentalRequestId, rating, comment } = payload;

    // 1. Find the rental request that belongs to this tenant
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: rentalRequestId,
            tenantId,
        },
        select: {
            id: true,
            tenantId: true,
            propertyId: true,
            status: true,
            review: {
                select: { id: true },
            },
        },
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    // 2. Rental must be COMPLETED before a review can be submitted
    if (rentalRequest.status !== RentalStatus.COMPLETED) {
        throw new AppError(400, "You can only review a completed rental");
    }

    // 3. Enforce one review per rental request
    if (rentalRequest.review) {
        throw new AppError(409, "You have already submitted a review for this rental");
    }

    // 4. Persist the review and refresh the property aggregate rating in one transaction
    const review = await prisma.$transaction(async (transaction) => {
        const createdReview = await transaction.review.create({
            data: {
                tenantId,
                propertyId: rentalRequest.propertyId,
                rentalRequestId,
                rating,
                comment,
            },
            select: reviewSelect,
        });

        await recalculatePropertyReviewStats(transaction, rentalRequest.propertyId);

        return createdReview;
    });

    return review;
};

const updateMyReviewIntoDB = async (tenantId: string, reviewId: string, payload: IUpdateReview) => {
    const review = await prisma.review.findFirst({
        where: {
            id: reviewId,
            tenantId,
        },
        select: {
            id: true,
            propertyId: true,
        },
    });

    if (!review) {
        throw new AppError(404, "Review not found");
    }

    return prisma.$transaction(async (transaction) => {
        const updatedReview = await transaction.review.update({
            where: {
                id: reviewId,
            },
            data: payload,
            select: reviewSelect,
        });

        await recalculatePropertyReviewStats(transaction, review.propertyId);

        return updatedReview;
    });
};

const deleteMyReviewFromDB = async (tenantId: string, reviewId: string) => {
    const review = await prisma.review.findFirst({
        where: {
            id: reviewId,
            tenantId,
        },
        select: {
            id: true,
            propertyId: true,
        },
    });

    if (!review) {
        throw new AppError(404, "Review not found");
    }

    return prisma.$transaction(async (transaction) => {
        const deletedReview = await transaction.review.delete({
            where: {
                id: reviewId,
            },
            select: reviewSelect,
        });

        await recalculatePropertyReviewStats(transaction, review.propertyId);

        return deletedReview;
    });
};

const getMyReviewsFromDB = async (tenantId: string) => {
    return prisma.review.findMany({
        where: {
            tenantId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            rentalRequestId: true,
            property: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    location: true,
                    city: true,
                    state: true,
                    price: true,
                    mainImage: true,
                    isAvailable: true,
                    rating: true,
                    reviewCount: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
};

export const reviewService = {
    createReviewIntoDB,
    getMyReviewsFromDB,
    updateMyReviewIntoDB,
    deleteMyReviewFromDB,
};
