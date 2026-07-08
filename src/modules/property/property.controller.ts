import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const getProperties = catchAsync(async (req: Request, res: Response) => {
    const payload = req.query;
    const result = await propertyService.getPropertiesFromDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
    const propertyId = req.params.id;
    const property = await propertyService.getPropertyByIdFromDB(propertyId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property fetched successfully",
        data: property,
    });
});

export const propertyController = {
    getProperties,
    getPropertyById,
};
