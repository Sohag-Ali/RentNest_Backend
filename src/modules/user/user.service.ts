import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { CreateUserRequest, UpdateUserProfilePayload } from "./user.interface";

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  phone: true,
  bio: true,
  gender: true,
  dateOfBirth: true,
  occupation: true,
  address: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
  website: true,
  github: true,
  linkedin: true,
  facebook: true,
  role: true,
  status: true,
  rating: true,
  isVerified: true,
  isSuperhost: true,
  responseRate: true,
  responseTime: true,
  createdAt: true,
} as const;

const createUser = async (payload: CreateUserRequest) => {
  const { name, email, password, phone, role } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(400, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    },
    select: userProfileSelect,
  });

  return createdUser;
};

const getMyProfileIntoDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

const updateMyProfileInDB = async (userId: string, payload: UpdateUserProfilePayload) => {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new AppError(404, "User not found");
  }

  // Filter out any empty string URLs or undefined values safely
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      updateData[key] = value === "" ? null : value;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userProfileSelect,
  });

  return updatedUser;
};

export const userService = {
  createUser,
  getMyProfileIntoDB,
  updateMyProfileInDB,
};