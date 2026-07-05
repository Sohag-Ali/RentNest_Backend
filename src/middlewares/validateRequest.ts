import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

type RequestDataSource = "body" | "query" | "params";

const assignValidatedData = (
    req: Request,
    source: RequestDataSource,
    data: unknown,
) => {
    if (source === "body") {
        req.body = data;
        return;
    }

    if (source === "query") {
        req.query = data as Request["query"];
        return;
    }

    req.params = data as Request["params"];
};

export const validateRequest = (
    schema: ZodTypeAny,
    source: RequestDataSource = "body",
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = schema.safeParse(req[source]);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errorDetails: validationResult.error.flatten(),
            });
        }

        assignValidatedData(req, source, validationResult.data);
        next();
    };
};