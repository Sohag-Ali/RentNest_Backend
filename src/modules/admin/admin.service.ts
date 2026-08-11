import { Prisma } from "../../../generated/prisma/client";
import { PaymentStatus, RentalStatus, Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AdminAnalyticsQuery, AdminPropertiesQuery, AdminRentalsQuery, AdminUpdateUserStatusInput, AdminUsersQuery } from "./admin.interface";





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

const getStartDateFromPeriod = (period: "7d" | "30d" | "90d" | "all" = "30d"): Date | null => {
    if (period === "all") {
        return null;
    }

    const now = new Date();
    const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
    };

    const days = daysMap[period] ?? 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return startDate;
};

const getAnalyticsFromDB = async (query: AdminAnalyticsQuery) => {
    const period = query.period ?? "30d";
    const startDate = getStartDateFromPeriod(period);

    const [
        totalProperties,
        totalTenants,
        totalLandlords,
        totalRentalRequests,
        revenueAggregation,
        totalWishlists,
        completedPayments,
        rentalRequestsGroup,
        categoriesWithCount,
        propertiesByCityGroup,
        userGrowthList,
        availabilityGroup,
        recentRentalsList,
        propertiesList,
    ] = await Promise.all([
        prisma.property.count(),
        prisma.user.count({ where: { role: Role.TENANT } }),
        prisma.user.count({ where: { role: Role.LANDLORD } }),
        prisma.rentalRequest.count(),
        prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: PaymentStatus.COMPLETED,
            },
        }),
        prisma.wishlist.count(),

        prisma.payment.findMany({
            where: {
                status: PaymentStatus.COMPLETED,
                ...(startDate ? {
                    OR: [
                        { paidAt: { gte: startDate } },
                        { paidAt: null, createdAt: { gte: startDate } },
                    ],
                } : {}),
            },
            select: {
                amount: true,
                paidAt: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),

        prisma.rentalRequest.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        }),

        prisma.category.findMany({
            select: {
                name: true,
                _count: {
                    select: {
                        properties: true,
                    },
                },
            },
        }),

        prisma.property.groupBy({
            by: ["city"],
            _count: {
                city: true,
            },
        }),

        prisma.user.findMany({
            where: {
                role: {
                    in: [Role.TENANT, Role.LANDLORD],
                },
                ...(startDate ? { createdAt: { gte: startDate } } : {}),
            },
            select: {
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),

        prisma.property.groupBy({
            by: ["isAvailable"],
            _count: {
                isAvailable: true,
            },
        }),

        prisma.rentalRequest.findMany({
            take: 10,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                status: true,
                moveInDate: true,
                createdAt: true,
                tenant: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                property: {
                    select: {
                        title: true,
                        mainImage: true,
                        price: true,
                        landlord: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.property.findMany({
            select: {
                id: true,
                title: true,
                mainImage: true,
                location: true,
                price: true,
                rating: true,
                _count: {
                    select: {
                        wishlists: true,
                        rentalRequests: true,
                    },
                },
            },
        }),
    ]);

    const overview = {
        totalProperties,
        totalTenants,
        totalLandlords,
        totalRentalRequests,
        totalRevenue: revenueAggregation._sum.amount ?? 0,
        totalWishlists,
    };

    const revenueMap = new Map<string, number>();
    for (const payment of completedPayments) {
        const dateObj = payment.paidAt || payment.createdAt;
        const dateStr = dateObj.toISOString().split("T")[0]!;
        revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + payment.amount);
    }
    const revenueOverview = Array.from(revenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const statusCountMap = new Map<RentalStatus, number>();
    for (const item of rentalRequestsGroup) {
        statusCountMap.set(item.status, item._count.status);
    }

    const requiredStatuses: RentalStatus[] = [
        RentalStatus.PENDING,
        RentalStatus.APPROVED,
        RentalStatus.REJECTED,
        RentalStatus.CANCELLED,
        RentalStatus.COMPLETED,
    ];

    const rentalRequests = requiredStatuses.map((status) => ({
        status,
        count: statusCountMap.get(status) ?? 0,
    }));

    const propertiesByCategory = categoriesWithCount.map((cat) => ({
        category: cat.name,
        count: cat._count.properties,
    }));

    const propertiesByCity = propertiesByCityGroup
        .filter((item) => item.city && item.city.trim() !== "")
        .map((item) => ({
            city: item.city!,
            count: item._count.city,
        }));

    const userGrowthMap = new Map<string, { tenants: number; landlords: number }>();
    for (const u of userGrowthList) {
        const dateStr = u.createdAt.toISOString().split("T")[0]!;
        const current = userGrowthMap.get(dateStr) || { tenants: 0, landlords: 0 };
        if (u.role === Role.TENANT) {
            current.tenants += 1;
        } else if (u.role === Role.LANDLORD) {
            current.landlords += 1;
        }
        userGrowthMap.set(dateStr, current);
    }


    const userGrowth = Array.from(userGrowthMap.entries())
        .map(([date, counts]) => ({
            date,
            tenants: counts.tenants,
            landlords: counts.landlords,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    let available = 0;
    let unavailable = 0;
    for (const item of availabilityGroup) {
        if (item.isAvailable) {
            available = item._count.isAvailable;
        } else {
            unavailable = item._count.isAvailable;
        }
    }
    const availability = { available, unavailable };

    const recentRentals = recentRentalsList.map((r) => ({
        id: r.id,
        status: r.status,
        moveInDate: r.moveInDate,
        createdAt: r.createdAt,
        tenantName: r.tenant?.name ?? "",
        tenantEmail: r.tenant?.email ?? "",
        propertyTitle: r.property?.title ?? "",
        propertyMainImage: r.property?.mainImage ?? "",
        propertyPrice: r.property?.price ?? 0,
        landlordName: r.property?.landlord?.name ?? "",
    }));

    const topProperties = propertiesList
        .map((p) => ({
            id: p.id,
            title: p.title,
            mainImage: p.mainImage,
            location: p.location,
            price: p.price,
            wishlistCount: p._count.wishlists,
            rentalRequestCount: p._count.rentalRequests,
            rating: p.rating,
            activityScore: p._count.wishlists + p._count.rentalRequests,
        }))
        .sort((a, b) => b.activityScore - a.activityScore)
        .slice(0, 5)
        .map(({ activityScore, ...rest }) => rest);

    return {
        overview,
        revenueOverview,
        rentalRequests,
        propertiesByCategory,
        propertiesByCity,
        userGrowth,
        availability,
        recentRentals,
        topProperties,
    };
};

export const adminService = {
    getUsersFromDB,
    updateUserStatusIntoDB,
    getPropertiesFromDB,
    getRentalsFromDB,
    getAnalyticsFromDB,
};

