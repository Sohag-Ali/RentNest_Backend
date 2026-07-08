import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { PropertyListQuery } from "./property.interface";



const propertyListSelect = {
    id: true,
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
    landlord: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

const propertyDetailsSelect = {
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
            email: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    reviews: {
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            tenant: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    },
} as const;

const buildPropertyWhereClause = (query: PropertyListQuery): Prisma.PropertyWhereInput => {
    const where: Prisma.PropertyWhereInput = {
        isAvailable: true,
    };

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

    if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
        where.price = {
            ...(typeof query.minPrice === "number" ? { gte: query.minPrice } : {}),
            ...(typeof query.maxPrice === "number" ? { lte: query.maxPrice } : {}),
        };
    }

    return where;
};

const getPropertiesFromDB = async (query: PropertyListQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = buildPropertyWhereClause(query);

    const [total, properties] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.findMany({
            where,
            skip,
            take: limit,
            orderBy:
                query.sort === "price_asc"
                    ? { price: "asc" }
                    : query.sort === "price_desc"
                      ? { price: "desc" }
                      : { createdAt: "desc" },
            select: propertyListSelect,
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

const getPropertyByIdFromDB = async (propertyId: string) => {
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId,
            isAvailable: true,
        },
        select: propertyDetailsSelect,
    });

    if (!property) {
        throw new AppError(404, "Property not found");
    }

    const ratingAggregate = await prisma.review.aggregate({
        where: {
            propertyId,
        },
        _avg: {
            rating: true,
        },
    });

    return {
        ...property,
        averageRating: ratingAggregate._avg.rating ?? 0,
    };
};

export const propertyService = {
    getPropertiesFromDB,
    getPropertyByIdFromDB,
};
