import { Prisma } from "../../../generated/prisma/client";
import { PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { propertyService } from "../property/property.service";
import {
  CreateLandlordPropertyInput,
  GetLandlordRentedPropertiesQuery,
  UpdateLandlordPropertyInput,
  UpdateRentalRequestStatusInput,
} from "./landload.interface";

const propertySelect = {
  id: true,
  landlordId: true,
  categoryId: true,
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
  mainImage: true,
  images: true,
  amenities: true,
  isAvailable: true,
  isFeatured: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  overview: true,
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
      mainImage: true,
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

const rentedPropertySelect = {
  id: true,
  title: true,
  slug: true,
  mainImage: true,
  location: true,
  city: true,
  state: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  areaSqFt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const rentedRequestSelect = {
  id: true,
  status: true,
  moveInDate: true,
  createdAt: true,
  tenant: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      phone: true,
    },
  },
  property: {
    select: rentedPropertySelect,
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

type RentedPropertiesSummary = {
  totalRentedProperties: number;
  totalRevenue: number;
  totalCompletedPayments: number;
  averagePropertyPrice: number;
};

const buildRentalRequestWhere = (landlordId: string, query: GetLandlordRentedPropertiesQuery) => {
  const where: Prisma.RentalRequestWhereInput = {
    status: RentalStatus.COMPLETED,
    payment: {
      is: {
        status: PaymentStatus.COMPLETED,
      },
    },
    property: {
      landlordId,
    },
  };

  const andConditions: Prisma.RentalRequestWhereInput[] = [];

  if (query.search) {
    andConditions.push({
      OR: [
        {
          property: {
            title: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
        {
          tenant: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (query.city) {
    andConditions.push({
      property: {
        city: {
          contains: query.city,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.category) {
    andConditions.push({
      property: {
        category: {
          name: {
            equals: query.category,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (query.paymentStatus) {
    andConditions.push({
      payment: {
        is: {
          status: query.paymentStatus,
        },
      },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
};

const buildRentedPropertiesSummaryWhere = (landlordId: string, query: GetLandlordRentedPropertiesQuery) => {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`rr."status" = ${RentalStatus.COMPLETED}`,
    Prisma.sql`p."status" = ${PaymentStatus.COMPLETED}`,
    Prisma.sql`prop."landlordId" = ${landlordId}`,
  ];

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    conditions.push(
      Prisma.sql`(prop."title" ILIKE ${searchPattern} OR tenant."name" ILIKE ${searchPattern})`,
    );
  }

  if (query.city) {
    conditions.push(Prisma.sql`prop."city" ILIKE ${`%${query.city}%`}`);
  }

  if (query.category) {
    conditions.push(Prisma.sql`cat."name" ILIKE ${query.category}`);
  }

  if (query.paymentStatus) {
    conditions.push(Prisma.sql`p."status" = ${query.paymentStatus}`);
  }

  return conditions.reduce(
    (accumulator, condition, index) => (index === 0 ? condition : Prisma.sql`${accumulator} AND ${condition}`),
  );
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
  return propertyService.createPropertyInDB(landlordId, payload);
};

const updatePropertyIntoDB = async (
  landlordId: string,
  propertyId: string,
  payload: UpdateLandlordPropertyInput,
) => {
  await ensureLandlordPropertyExists(propertyId, landlordId);

  const { overview, categoryId, ...propertyData } = payload;

  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      ...propertyData,
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      ...(overview
        ? {
            overview: {
              upsert: {
                create: overview,
                update: overview,
              },
            },
          }
        : {}),
    },
    select: propertySelect,
  });
  return result;
};

const deletePropertyIntoDB = async (landlordId: string, propertyId: string) => {
  await ensureLandlordPropertyExists(propertyId, landlordId);

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

const getRentedPropertiesFromDB = async (
  landlordId: string,
  query: GetLandlordRentedPropertiesQuery,
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = buildRentalRequestWhere(landlordId, query);

  const orderBy =
    query.sort === "paidDateDesc"
      ? [{ payment: { paidAt: "desc" as const } }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const rentedPropertiesQuery = prisma.rentalRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    select: rentedRequestSelect,
  });

  const summaryQuery = prisma.$queryRaw<Array<RentedPropertiesSummary>>(
    Prisma.sql`
      SELECT
        COUNT(DISTINCT rr."id")::int AS "totalRentedProperties",
        COALESCE(SUM(p."amount"), 0)::float8 AS "totalRevenue",
        COUNT(DISTINCT p."id")::int AS "totalCompletedPayments",
        COALESCE(AVG(prop."price"), 0)::float8 AS "averagePropertyPrice"
      FROM "RentalRequest" rr
      INNER JOIN "Payment" p ON p."rentalRequestId" = rr."id"
      INNER JOIN "Property" prop ON prop."id" = rr."propertyId"
      INNER JOIN "User" tenant ON tenant."id" = rr."tenantId"
      INNER JOIN "Category" cat ON cat."id" = prop."categoryId"
      WHERE ${buildRentedPropertiesSummaryWhere(landlordId, query)}
    `,
  );

  const [data, summaryResult] = await prisma.$transaction([rentedPropertiesQuery, summaryQuery]);
  const summary = summaryResult[0] ?? {
    totalRentedProperties: 0,
    totalRevenue: 0,
    totalCompletedPayments: 0,
    averagePropertyPrice: 0,
  };

  const total = summary.totalRentedProperties;
  const totalPage = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    summary,
    message: total === 0 ? "No rented properties found" : "Rented properties fetched successfully",
  };
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
  getRentedPropertiesFromDB,
  updateRentalRequestStatusIntoDB,
};
