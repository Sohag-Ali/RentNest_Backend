import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { CreateUserRequest } from "./user.interface";



const createUser = async (payload: CreateUserRequest) => {

    const { name, email, password, role } = payload;
    const isUserExists = await prisma.user.findUnique(
        {
            where: {
                email,
            },
        }

    );

    if (isUserExists) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        },
        omit: {
            password: true,
        },
    })

    return createdUser;
}

const getMyProfileIntoDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
}

export const userService = {
    createUser,
    getMyProfileIntoDB
}