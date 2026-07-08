import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const result = await paymentService.createPaymentIntentIntoDB(currentUser.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment intent created successfully",
        data: result,
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const payment = await paymentService.confirmPaymentIntoDB(currentUser.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment confirmed successfully",
        data: payment,
    });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    const payments = await paymentService.getMyPaymentsFromDB(currentUser.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history fetched successfully",
        data: payments,
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const currentUser = req.user;
    const paymentId = req.params.id;

    if (!currentUser) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: httpStatus.UNAUTHORIZED,
            message: "Unauthorized access",
            error: "Authenticated user information is missing",
        });
    }

    if (typeof paymentId !== "string") {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "Invalid request",
            error: "Payment ID is required",
        });
    }

    const payment = await paymentService.getPaymentByIdFromDB(currentUser.id, paymentId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details fetched successfully",
        data: payment,
    });
});

const paymentSuccess = (req: Request, res: Response) => {
    const sessionId = req.query.session_id;
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment successful",
        data: { sessionId },
    });
};

const paymentCancel = (req: Request, res: Response) => {
    sendResponse(res, {
        success: false,
        statusCode: httpStatus.OK,
        message: "Payment cancelled",
        data: null,
    });
};

export const paymentController = {
    createPayment,
    confirmPayment,
    getMyPayments,
    getPaymentById,
    paymentSuccess,
    paymentCancel,
};
