import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const getReviewIdParam = (req: Request) => {
    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
        throw new AppError(400, "Review ID is required");
    }

    return reviewId;
};

const createReview = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user!;

    const result = await reviewService.createReviewIntoDB(currentUser.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review submitted successfully",
        data: result,
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user!;

    const result = await reviewService.getMyReviewsFromDB(currentUser.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My reviews retrieved successfully",
        data: result,
    });
});

const updateMyReview = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user!;
    const reviewId = getReviewIdParam(req);

    const result = await reviewService.updateMyReviewIntoDB(currentUser.id, reviewId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteMyReview = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user!;
    const reviewId = getReviewIdParam(req);

    const result = await reviewService.deleteMyReviewFromDB(currentUser.id, reviewId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review deleted successfully",
        data: result,
    });
});

export const reviewController = {
    createReview,
    getMyReviews,
    updateMyReview,
    deleteMyReview,
};
