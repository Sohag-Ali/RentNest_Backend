import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const createdRentalRequest = await rentalService.createRentalRequestIntoDB(currentUser.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental request created successfully",
        data: createdRentalRequest,
    });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const rentalRequests = await rentalService.getMyRentalRequestsFromDB(currentUser.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests fetched successfully",
        data: rentalRequests,
    });
});

const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;
    const rentalRequestId = req.params.id;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    if (typeof rentalRequestId !== "string") {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "Invalid request",
            error: "Rental request ID is required ! ",
        });
    }

    const rentalRequest = await rentalService.getRentalRequestByIdFromDB(currentUser.id, rentalRequestId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request fetched successfully",
        data: rentalRequest,
    });
});

export const rentalController = {
    createRentalRequest,
    getMyRentalRequests,
    getRentalRequestById,
};
