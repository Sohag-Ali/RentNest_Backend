import type { Request, Response } from "express";
import httpStatus from "http-status";
import { landlordService } from "./landlord.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createProperty = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;
    const payload = req.body;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const createdProperty = await landlordService.createPropertyIntoDB(currentUser.id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: createdProperty,
    });
});


const updateProperty = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const updatedProperty = await landlordService.updatePropertyIntoDB(
        currentUser.id,
        req.params.id,
        req.body,
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: updatedProperty,
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const deletedProperty = await landlordService.deletePropertyIntoDB(currentUser.id, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: deletedProperty,
    });
});

const getLandlordRequests = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const requests = await landlordService.getLandlordRequestsFromDB(currentUser.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests fetched successfully",
        data: requests,
    });
});

const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const updatedRequest = await landlordService.updateRentalRequestStatusIntoDB(
        currentUser.id,
        req.params.id,
        req.body,
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental request status updated successfully",
        data: updatedRequest,
    });
});

export const landlordController = {
    createProperty,
    updateProperty,
    deleteProperty,
    getLandlordRequests,
    updateRentalRequestStatus,
};
