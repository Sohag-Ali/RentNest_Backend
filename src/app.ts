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



export default app;