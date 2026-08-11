import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { wishlistService } from "./wishlist.service";

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const { propertyId } = req.body;
  const result = await wishlistService.addToWishlistInDB(currentUser.id, propertyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property added to wishlist successfully",
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;
  const { propertyId } = req.params;

  if (!currentUser) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  if (!propertyId || typeof propertyId !== "string") {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Invalid request",
      error: "Property ID is required",
    });
  }

  const result = await wishlistService.removeFromWishlistInDB(currentUser.id, propertyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const { propertyId } = req.body;
  const result = await wishlistService.toggleWishlistInDB(currentUser.id, propertyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await wishlistService.getMyWishlistFromDB(currentUser.id, { page, limit });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist properties retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const checkWishlistStatus = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;
  const { propertyId } = req.params;

  if (!currentUser) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  if (!propertyId || typeof propertyId !== "string") {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Invalid request",
      error: "Property ID is required",
    });
  }

  const result = await wishlistService.checkWishlistStatusFromDB(currentUser.id, propertyId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wishlist status checked successfully",
    data: result,
  });
});

export const wishlistController = {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getMyWishlist,
  checkWishlistStatus,
};
