import express, { Application, Request, Response } from "express";

import httpStatus from "http-status";

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const createdUser = await userService.createUser(payload);

    // res.status(httpStatus.OK).json({ message: "User registered successfully", user: createdUser });
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User registered successfully",
        data: createdUser
    })
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const cookies = req.cookies;
    console.log(cookies);
});
export const userController = {
    createUser,
    getMyProfile
}