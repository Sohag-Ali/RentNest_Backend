import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyListQuery } from "./property.interface";
import { propertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;

  if (!landlordId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const result = await propertyService.createPropertyInDB(landlordId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: result,
  });
});

const getProperties = catchAsync(async (req: Request, res: Response) => {
  const payload = req.query as PropertyListQuery;
  const result = await propertyService.getPropertiesFromDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
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
    message: "Property retrieved successfully",
    data: property,
  });
});

export const propertyController = {
  createProperty,
  getProperties,
  getPropertyById,
};
