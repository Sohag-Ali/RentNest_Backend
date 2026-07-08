import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getUsersFromDB(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const updatedUser = await adminService.updateUserStatusIntoDB(currentUser.id, req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: updatedUser,
    });
});

const getProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getPropertiesFromDB(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getRentals = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getRentalsFromDB(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rentals fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const adminController = {
    getUsers,
    updateUserStatus,
    getProperties,
    getRentals,
};
