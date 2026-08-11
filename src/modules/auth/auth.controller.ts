import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await authService.loginUser(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const refreshTokenCookie = req.cookies.refreshToken;
  const { accessToken } = await authService.refreshToken(refreshTokenCookie);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token Refreshed Successfully",
    data: {
      accessToken,
    },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { credential } = req.body;
  const { accessToken, refreshToken } = await authService.googleLoginIntoDB(credential);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully with Google",
    data: { accessToken, refreshToken },
  });
});

const logout = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged out successfully",
    data: null,
  });
});

export const authController = {
  loginUser,
  googleLogin,
  refreshToken,
  logout,
};