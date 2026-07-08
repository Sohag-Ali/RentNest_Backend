import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateReview } from "./review.interface";

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

    // 4. Persist the review
    const review = await prisma.review.create({
        data: {
            tenantId,
            propertyId: rentalRequest.propertyId,
            rentalRequestId,
            rating,
            comment,
        },
        select: {
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
                },
            },
        },
    });

    return review;
};

export const reviewService = {
    createReviewIntoDB,
};
