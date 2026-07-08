import express, { Application, Request, Response } from "express";

import httpStatus from "http-status";

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";
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

}

export const userService = {
    createUser,
    getMyProfileIntoDB
}