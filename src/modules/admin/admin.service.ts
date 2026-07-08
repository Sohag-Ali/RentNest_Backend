import { Prisma } from "../../../generated/prisma/client";
import { RentalStatus, Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AdminPropertiesQuery, AdminRentalsQuery, AdminUpdateUserStatusInput, AdminUsersQuery } from "./admin.interface";



const adminUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} as const;

const adminPropertySelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    price: true,
    amenities: true,
    isAvailable: true,
    createdAt: true,
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
} as const;

const adminRentalSelect = {
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
        },
    },
    property: {
        select: {
            id: true,
            title: true,
            location: true,
            price: true,
            isAvailable: true,
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
} as const;

const mapBlockedToBanned = (status?: UserStatus | "BANNED") => {
    if (status === "BANNED") {
        return UserStatus.BANNED;
    }

    return status;
};

const getUsersFromDB = async (query: AdminUsersQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
        where.OR = [
            {
                name: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (query.role) {
        where.role = query.role;
    }

    const status = mapBlockedToBanned(query.status);

    if (status) {
        where.status = status;
    }

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: adminUserSelect,
        }),
    ]);

    return {
        data: users,
        meta: {
            page,
            limit,
            total,
        },
    };
};

const updateUserStatusIntoDB = async (adminId: string, userId: string, payload: AdminUpdateUserStatusInput) => {
    if (adminId === userId && payload.status === "BANNED") {
        throw new AppError(400, "You cannot ban yourself");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
        },
    });

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const nextStatus = payload.status === "BANNED" ? UserStatus.BANNED : payload.status;

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: nextStatus,
        },
        select: adminUserSelect,
    });
};

const getPropertiesFromDB = async (query: AdminPropertiesQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {};

    if (query.location) {
        where.location = {
            contains: query.location,
            mode: "insensitive",
        };
    }

    if (query.category) {
        where.category = {
            name: {
                equals: query.category,
                mode: "insensitive",
            },
        };
    }

    if (typeof query.availability === "boolean") {
        where.isAvailable = query.availability;
    }

    const orderBy =
        query.sort === "oldest"
            ? { createdAt: "asc" as const }
            : query.sort === "price"
              ? { price: "asc" as const }
              : { createdAt: "desc" as const };

    const [total, properties] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: adminPropertySelect,
        }),
    ]);

    return {
        data: properties,
        meta: {
            page,
            limit,
            total,
        },
    };
};

const getRentalsFromDB = async (query: AdminRentalsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RentalRequestWhereInput = {};

    if (query.status) {
        where.status = query.status;
    }

    const [total, rentals] = await Promise.all([
        prisma.rentalRequest.count({ where }),
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: adminRentalSelect,
        }),
    ]);

    return {
        data: rentals,
        meta: {
            page,
            limit,
            total,
        },
    };
};

export const adminService = {
    getUsersFromDB,
    updateUserStatusIntoDB,
    getPropertiesFromDB,
    getRentalsFromDB,
};
