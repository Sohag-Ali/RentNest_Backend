import { prisma } from "../../lib/prisma";
import { RentalStatus } from "../../../generated/prisma/enums";
import { propertyService } from "../property/property.service";
import { CreateLandlordPropertyInput, UpdateLandlordPropertyInput, UpdateRentalRequestStatusInput } from "./landload.interface";

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
