import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { WishlistQuery } from "./wishlist.interface";

const wishlistPropertySelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
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
    },
  },
} as const;

const addToWishlistInDB = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  const existingWishlist = await prisma.wishlist.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingWishlist) {
    throw new AppError(400, "Property is already in your wishlist");
  }

  const wishlist = await prisma.wishlist.create({
    data: {
      userId,
      propertyId,
    },
    include: {
      property: {
        select: wishlistPropertySelect,
      },
    },
  });

  return wishlist;
};

const removeFromWishlistInDB = async (userId: string, propertyId: string) => {
  const existingWishlist = await prisma.wishlist.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (!existingWishlist) {
    throw new AppError(404, "Property is not in your wishlist");
  }

  await prisma.wishlist.delete({
    where: {
      id: existingWishlist.id,
    },
  });

  return { message: "Property removed from wishlist successfully" };
};

const toggleWishlistInDB = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  const existingWishlist = await prisma.wishlist.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingWishlist) {
    await prisma.wishlist.delete({
      where: {
        id: existingWishlist.id,
      },
    });

    return {
      isWishlisted: false,
      message: "Property removed from wishlist",
    };
  } else {
    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        propertyId,
      },
      include: {
        property: {
          select: wishlistPropertySelect,
        },
      },
    });

    return {
      isWishlisted: true,
      message: "Property added to wishlist",
      data: wishlist,
    };
  }
};

const getMyWishlistFromDB = async (userId: string, query: WishlistQuery = {}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const [total, wishlists] = await Promise.all([
    prisma.wishlist.count({
      where: { userId },
    }),
    prisma.wishlist.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        property: {
          select: wishlistPropertySelect,
        },
      },
    }),
  ]);

  return {
    data: wishlists,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const checkWishlistStatusFromDB = async (userId: string, propertyId: string) => {
  const existingWishlist = await prisma.wishlist.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  return {
    isWishlisted: !!existingWishlist,
    wishlistId: existingWishlist ? existingWishlist.id : null,
  };
};

export const wishlistService = {
  addToWishlistInDB,
  removeFromWishlistInDB,
  toggleWishlistInDB,
  getMyWishlistFromDB,
  checkWishlistStatusFromDB,
};
