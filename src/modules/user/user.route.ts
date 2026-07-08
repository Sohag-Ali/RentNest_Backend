import { Router } from "express";

import express, { Application, Request, Response } from "express";

import httpStatus from "http-status";

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";

import { createUserValidation } from "./user.validation";


const router = Router();

router.post(
    "/register",
    validateRequest(createUserValidation),
    userController.createUser,
);

router.get("/me", userController.getMyProfile);

export const userRouter = router;