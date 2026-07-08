import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { CreateRentalRequestInput } from "./rental.interface";


const rentalRequestSelect = {
    id: true,
    tenantId: true,
    propertyId: true,
    status: true,
    moveInDate: true,
    createdAt: true,
    property: {
        select: {
            id: true,
            title: true,
            description: true,
            location: true,
            price: true,
            isAvailable: true,
            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
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
    payment: {
        select: {
            id: true,
            transactionId: true,
            amount: true,
            provider: true,
            status: true,
            paidAt: true,
            createdAt: true,
        },
    },
    review: {
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
        },
    },
} as const;

const propertySelect = {
    id: true,
    landlordId: true,
    isAvailable: true,
    landlord: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

const createRentalRequestIntoDB = async (tenantId: string, payload: CreateRentalRequestInput) => {
    const property = await prisma.property.findUnique({
        where: {
            id: payload.propertyId,
        },
        select: propertySelect,
    });

    if (!property) {
        throw new AppError(404, "Property not found");
    }

    if (!property.isAvailable) {
        throw new AppError(400, "Property is not available for rent");
    }

    if (property.landlordId === tenantId) {
        throw new AppError(400, "You cannot rent your own property");
    }

    const existingPendingRequest = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId: payload.propertyId,
            status: RentalStatus.PENDING,
        },
        select: {
            id: true,
        },
    });

    if (existingPendingRequest) {
        throw new AppError(409, "You already have a pending rental request for this property");
    }

    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            tenantId,
            propertyId: payload.propertyId,
            moveInDate: payload.moveInDate,
            status: RentalStatus.PENDING,
        },
        select: rentalRequestSelect,
    });
    return rentalRequest;
};

const getMyRentalRequestsFromDB = async (tenantId: string) => {
    const rentalRequests = await prisma.rentalRequest.findMany({
        where: {
            tenantId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: rentalRequestSelect,
    });
    return rentalRequests;
};

const getRentalRequestByIdFromDB = async (tenantId: string, rentalRequestId: string) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: rentalRequestId,
            tenantId,
        },
        select: rentalRequestSelect,
    });

    if (!rentalRequest) {
        throw new AppError(404, "Rental request not found");
    }

    return rentalRequest;
};

export const rentalService = {
    createRentalRequestIntoDB,
    getMyRentalRequestsFromDB,
    getRentalRequestByIdFromDB,
};
