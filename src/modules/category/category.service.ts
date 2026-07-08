import { prisma } from "../../lib/prisma";

const getCategoriesFromDB = async () => {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

export const categoryService = {
    getCategoriesFromDB,
};
