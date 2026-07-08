import type { Request, Response } from "express";
import httpStatus from "http-status";
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
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const profile = await userService.getMyProfileIntoDB(currentUser.id);

    if (!profile) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            statusCode: httpStatus.NOT_FOUND,
            message: "User not found",
            error: "The authenticated user could not be located",
        });
    }

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Current user fetched successfully",
        data: profile,
    });
});
export const userController = {
    createUser,
    getMyProfile
}