import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const createdUser = await userService.createUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: createdUser,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser?.id) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const profile = await userService.getMyProfileIntoDB(currentUser.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Current user fetched successfully",
    data: profile,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser?.id) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized access",
      error: "Authenticated user information is missing",
    });
  }

  const updatedProfile = await userService.updateMyProfileInDB(currentUser.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile updated successfully",
    data: updatedProfile,
  });
});

export const userController = {
  createUser,
  getMyProfile,
  updateMyProfile,
};