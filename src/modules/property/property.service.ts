import { Prisma } from "../../../generated/prisma/client";
import { NotificationType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { createNotification } from "../notification/notification.service";
import { CreatePropertyInput, PropertyListQuery } from "./property.interface";

const propertyListSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  detailedDescription: true,
  location: true,
  city: true,
  state: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  areaSqFt: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
  isAvailable: true,
  mainImage: true,
  images: true,
  amenities: true,
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
      email: true,
      avatar: true,
      phone: true,
      isSuperhost: true,
      isVerified: true,
      rating: true,
      responseRate: true,
      responseTime: true,
      createdAt: true,
    },
  },

  overview: true,
} as const;

const propertyDetailsSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  detailedDescription: true,
  location: true,
  city: true,
  state: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  areaSqFt: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
  isAvailable: true,
  mainImage: true,
  images: true,
  amenities: true,
  createdAt: true,
  updatedAt: true,

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
      email: true,
      avatar: true,
      phone: true,
      isSuperhost: true,
      isVerified: true,
      rating: true,
      responseRate: true,
      responseTime: true,
      createdAt: true,
    },
  },

  overview: true,

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
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
} as const;

const featuredPropertySelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  city: true,
  state: true,
  mainImage: true,
  images: true,
  bedrooms: true,
  bathrooms: true,
  areaSqFt: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
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
      avatar: true,
      isVerified: true,
    },
  },
  _count: {
    select: {
      wishlists: true,
    },
  },
} as const;

const createPropertyInDB = async (landlordId: string, payload: CreatePropertyInput) => {
  const {
    categoryId,
    overview,
    title,
    slug,
    description,
    detailedDescription,
    location,
    city,
    state,
    price,
    bedrooms,
    bathrooms,
    areaSqFt,
    isFeatured,
    isAvailable,
    mainImage,
    images,
    amenities,
  } = payload;

  let category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    category = await prisma.category.findFirst({
      where: { name: { equals: categoryId, mode: "insensitive" } },
    });
  }

  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryId },
    });
  }

  const createdProperty = await prisma.property.create({
    data: {
      title,
      slug,
      description,
      detailedDescription,
      location,
      city,
      state,
      price,
      bedrooms,
      bathrooms,
      areaSqFt,
      isFeatured: isFeatured ?? false,
      isAvailable: isAvailable ?? true,
      mainImage,
      images: images ?? [],
      amenities: amenities ?? [],
      landlord: {
        connect: { id: landlordId },
      },
      category: {
        connect: { id: category.id },
      },
      ...(overview
        ? {
            overview: {
              create: {
                address: overview.address,
                city: overview.city,
                state: overview.state,
                zipCode: overview.zipCode,
                availableFrom: overview.availableFrom,
                status: overview.status,
                yearBuilt: overview.yearBuilt,
                depositAmount: overview.depositAmount,
                leaseTerm: overview.leaseTerm,
                petPolicy: overview.petPolicy,
                parkingType: overview.parkingType,
              },
            },
          }
        : {}),
    },
    select: propertyDetailsSelect,
  });

  await createNotification({
    userId: landlordId,
    type: NotificationType.NEW_PROPERTY,
    title: "Property Created",
    message: `Your property "${createdProperty.title}" has been successfully created.`,
    entityId: createdProperty.id,
    entityType: "Property",
  });

  return createdProperty;
};

const buildPropertyWhereClause = (query: PropertyListQuery): Prisma.PropertyWhereInput => {
  const where: Prisma.PropertyWhereInput = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.city) {
    where.city = { contains: query.city, mode: "insensitive" };
  }

  if (query.state) {
    where.state = { contains: query.state, mode: "insensitive" };
  }

  if (query.location) {
    where.location = { contains: query.location, mode: "insensitive" };
  }

  if (query.category) {
    where.category = {
      name: { equals: query.category, mode: "insensitive" },
    };
  }

  if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
    where.price = {
      ...(typeof query.minPrice === "number" ? { gte: query.minPrice } : {}),
      ...(typeof query.maxPrice === "number" ? { lte: query.maxPrice } : {}),
    };
  }

  if (typeof query.bedrooms === "number") {
    where.bedrooms = query.bedrooms;
  }

  if (typeof query.bathrooms === "number") {
    where.bathrooms = query.bathrooms;
  }

  if (typeof query.featured === "boolean") {
    where.isFeatured = query.featured;
  }

  return where;
};

const getPropertiesFromDB = async (query: PropertyListQuery) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const where = buildPropertyWhereClause(query);

  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };

  if (query.sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (query.sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (query.sort === "rating") {
    orderBy = { rating: "desc" };
  } else if (query.sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: propertyDetailsSelect,
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  return {
    ...property,
    averageRating: property.rating,
  };
};

const getFeaturedPropertiesFromDB = async () => {
  const featuredProperties = await prisma.property.findMany({
    where: {
      isFeatured: true,
      isAvailable: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
    select: featuredPropertySelect,
  });

  if (!featuredProperties.length) {
    return [];
  }

  return featuredProperties.map((property) => ({
    ...property,
    averageRating: property.rating,
    wishlistCount: property._count?.wishlists ?? 0,
  }));
};

export const propertyService = {
  createPropertyInDB,
  getPropertiesFromDB,
  getPropertyByIdFromDB,
  getFeaturedPropertiesFromDB,
};
