import { Router } from "express";

import express, { Application, Request, Response } from "express";

import httpStatus from "http-status";

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { userController } from "./user.controller";


const router = Router();

router.post("/register",userController.createUser);

export const userRouter = router;