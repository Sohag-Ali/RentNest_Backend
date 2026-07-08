import { prisma } from "../../lib/prisma";
import { RentalStatus } from "../../../generated/prisma/enums";
import { CreateLandlordPropertyInput, UpdateLandlordPropertyInput, UpdateRentalRequestStatusInput } from "./landload.interface";




const propertySelect = {
    id: true,
    landlordId: true,
    categoryId: true,
    title: true,
    description: true,
    location: true,
    price: true,
    amenities: true,
    isAvailable: true,
    createdAt: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

const rentalRequestSelect = {
    id: true,
    tenantId: true,
    propertyId: true,
    status: true,
    moveInDate: true,
    createdAt: true,
    tenant: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    },
    property: {
        select: {
            id: true,
            title: true,
            location: true,
            price: true,
            isAvailable: true,
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

const getOrCreateCategoryByName = async (categoryName: string) => {
    return prisma.category.upsert({
        where: {
            name: categoryName,
        },
        update: {},
        create: {
            name: categoryName,
        },
        select: {
            id: true,
            name: true,
        },
    });
};

const ensureLandlordPropertyExists = async (propertyId: string, landlordId: string) => {
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId,
            landlordId,
        },
        select: {
            id: true,
        },
    });

    if (!property) {
        throw new Error("Property not found or you do not have permission to modify it");
    }
};

const createPropertyIntoDB = async (landlordId: string, payload: CreateLandlordPropertyInput) => {
    const category = await getOrCreateCategoryByName(payload.categoryName);

    const result = await prisma.property.create({
        data: {
            landlordId,
            categoryId: category.id,
            title: payload.title,
            description: payload.description,
            location: payload.location,
            price: payload.price,
            amenities: payload.amenities ?? [],
            isAvailable: payload.isAvailable ?? true,
        },
        select: propertySelect,
    });
    return result;
};

const updatePropertyIntoDB = async (
    landlordId: string,
    propertyId: string,
    payload: UpdateLandlordPropertyInput,
) => {
    await ensureLandlordPropertyExists(propertyId, landlordId);

    let categoryId: string | undefined;

    if (payload.categoryName) {
        const category = await getOrCreateCategoryByName(payload.categoryName);
        categoryId = category.id;
    }

    const result = await prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            ...(categoryId ? { categoryId } : {}),
            ...(payload.title ? { title: payload.title } : {}),
            ...(payload.description ? { description: payload.description } : {}),
            ...(payload.location ? { location: payload.location } : {}),
            ...(typeof payload.price === "number" ? { price: payload.price } : {}),
            ...(payload.amenities ? { amenities: payload.amenities } : {}),
            ...(typeof payload.isAvailable === "boolean" ? { isAvailable: payload.isAvailable } : {}),
        },
        select: propertySelect,
    });
    return result;
};

const deletePropertyIntoDB = async (landlordId: string, propertyId: string) => {
    await ensureLandlordPropertyExists(propertyId, landlordId);

    // const [rentalRequestCount, reviewCount] = await Promise.all([
    //     prisma.rentalRequest.count({
    //         where: {
    //             propertyId,
    //         },
    //     }),
    //     prisma.review.count({
    //         where: {
    //             propertyId,
    //         },
    //     }),
    // ]);

    // if (rentalRequestCount > 0 || reviewCount > 0) {
    //     throw new Error("This property cannot be deleted because it has rental history or reviews");
    // }

    // return prisma.property.delete({
    //     where: {
    //         id: propertyId,
    //     },
    //     select: propertySelect,
    // });

    const result = await prisma.property.update({
        where: {
            id: propertyId,
        },
        data: {
            isAvailable: false,
        },
        select: propertySelect,
    });
    return result;
};

const getLandlordRequestsFromDB = async (landlordId: string) => {
    return prisma.rentalRequest.findMany({
        where: {
            property: {
                landlordId,
            },
        },
        select: rentalRequestSelect,
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateRentalRequestStatusIntoDB = async (
    landlordId: string,
    requestId: string,
    payload: UpdateRentalRequestStatusInput,
) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            id: requestId,
            property: {
                landlordId,
            },
        },
        select: {
            id: true,
            status: true,
            propertyId: true,
        },
    });

    if (!rentalRequest) {
        throw new Error("Rental request not found or you do not have permission to update it");
    }

    if (rentalRequest.status !== RentalStatus.PENDING) {
        throw new Error("Only pending rental requests can be updated");
    }

    const updatedRentalRequest = await prisma.$transaction(async (transaction) => {
        const updatedRequest = await transaction.rentalRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: payload.status,
            },
            select: rentalRequestSelect,
        });

        if (payload.status === RentalStatus.APPROVED) {
            await transaction.property.update({
                where: {
                    id: rentalRequest.propertyId,
                },
                data: {
                    isAvailable: false,
                },
            });
        }

        return updatedRequest;
    });

    return updatedRentalRequest;
};

export const landlordService = {
    createPropertyIntoDB,
    updatePropertyIntoDB,
    deletePropertyIntoDB,
    getLandlordRequestsFromDB,
    updateRentalRequestStatusIntoDB,
};
