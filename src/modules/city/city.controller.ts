import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { cityService } from "./city.service";

const getCities = catchAsync(async (req: Request, res: Response) => {
    const cities = await cityService.getCitiesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: cities.length ? "Cities fetched successfully" : "No cities found",
        data: cities,
    });
});

export const cityController = {
    getCities,
};
