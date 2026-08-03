import { prisma } from "../../lib/prisma";

const getCategoriesFromDB = async () => {
    return prisma.category.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    properties: true,
                },
            },
        },
        orderBy: {
            name: "desc",
        },
    }).then((categories) =>
        categories.map((category) => ({
            ...category,
            propertiesCount: category._count.properties,
        }))
    );
};

const createCategoryIntoDB = async (payload: { name: string }) => {
    const existingCategory = await prisma.category.findUnique({
        where: { name: payload.name.trim() },
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    return prisma.category.create({
        data: {
            name: payload.name.trim(),
        },
    });
};

export const categoryService = {
    getCategoriesFromDB,
    createCategoryIntoDB,
};
