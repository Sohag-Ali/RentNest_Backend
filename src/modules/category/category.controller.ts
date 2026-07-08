import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await categoryService.getCategoriesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Find Categories successfully",
        data: categories,
    });
});

export const categoryController = {
    getCategories,
};
