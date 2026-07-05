import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "../generated/prisma/enums";

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


app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;


    const isUserExists = await prisma.user.findUnique({ where: { email } });

    if (isUserExists) {
        return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        },
    })

    res.status(httpStatus.OK).json({ message: "User registered successfully", user: createdUser });
});

export default app;