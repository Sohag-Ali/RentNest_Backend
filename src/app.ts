import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/enums";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { landlordRouter } from "./modules/landlord/landlord.route";
import { rentalRouter } from "./modules/rental/rental.route";
import { propertyRouter } from "./modules/property/property.route";
import { adminRouter } from "./modules/admin/admin.route";
import { paymentRouter } from "./modules/payment/payment.route";

import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { categoriesRouter } from "./modules/category/category.route";

const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});


app.use("/api/auth", userRouter);

app.use("/api/auth", authRouter);

app.use("/api/landlord", landlordRouter);

app.use("/api/rentals", rentalRouter);

app.use("/api/properties", propertyRouter);

app.use("/api/categories", categoriesRouter);

app.use("/api/admin", adminRouter);

app.use("/api/payments", paymentRouter);

app.use(notFound);
app.use(globalErrorHandler);



export default app;