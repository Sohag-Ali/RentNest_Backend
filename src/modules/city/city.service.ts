import { prisma } from "../../lib/prisma";
import type { CityBrowseItem } from "./city.interface";

type CityAggregateRow = {
    city: string;
    _count: {
        city: number;
    };
    _min: {
        price: number | null;
    };
};

type CityImageRow = {
    city: string;
    mainImage: string;
    createdAt: Date;
};

const getCitiesFromDB = async (): Promise<CityBrowseItem[]> => {
    const cityAggregatesResult = await prisma.property.groupBy({
        by: ["city"],
        where: {
            isAvailable: true,
        },
        _count: {
            city: true,
        },
        _min: {
            price: true,
        },
        orderBy: {
            _count: {
                city: "desc",
            },
        },
    });

    const cityAggregates = cityAggregatesResult as unknown as CityAggregateRow[];

    if (!cityAggregates.length) {
        return [];
    }

    const cityNames = cityAggregates.map((item) => item.city);

    const cityImagesResult = await prisma.property.findMany({
        where: {
            isAvailable: true,
            city: {
                in: cityNames,
            },
        },
        select: {
            city: true,
            mainImage: true,
            createdAt: true,
        },
        orderBy: [
            {
                city: "asc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    const cityImages = cityImagesResult as unknown as CityImageRow[];

    const featuredImageByCity = new Map<string, string>();

    for (const item of cityImages) {
        if (!featuredImageByCity.has(item.city)) {
            featuredImageByCity.set(item.city, item.mainImage);
        }
    }

    return cityAggregates.map((item) => ({
        city: item.city,
        propertiesCount: item._count.city,
        featuredImage: featuredImageByCity.get(item.city) ?? "",
        startingPrice: item._min.price ?? 0,
    }));
};

export const cityService = {
    getCitiesFromDB,
};
