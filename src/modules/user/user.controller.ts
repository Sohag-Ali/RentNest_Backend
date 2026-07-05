import express, { Application, Request, Response } from "express";

import httpStatus from "http-status";

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { userService } from "./user.service";

const createUser =  async (req: Request, res: Response) => {
    const payload = req.body;

    const createdUser = await userService.createUser(payload);

    res.status(httpStatus.OK).json({ message: "User registered successfully", user: createdUser });
}

export const userController = {
    createUser
}