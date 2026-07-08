import { prisma } from "../../lib/prisma";

const getCategoriesFromDB = async () => {
    return prisma.category.findMany({
        orderBy: {
            name: "desc",
        },
    });
};

export const categoryService = {
    getCategoriesFromDB,
};
