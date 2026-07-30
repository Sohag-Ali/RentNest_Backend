import { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import { ILoginUser } from "./auth.interface";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(401, "Invalid credentials. Please check your email and password.");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "This user is banned. Please contact support for assistance.");
  }

  if (user.status === "INACTIVE") {
    throw new AppError(403, "This user is inactive. Please contact support for assistance.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid credentials. Please check your email and password.");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiration as SignOptions
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiration as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

  if (!verifiedRefreshToken.success) {
    throw new AppError(401, "Invalid refresh token");
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status === "BANNED") {
    throw new AppError(403, "User is banned!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiration as SignOptions
  );

  return { accessToken };
};

export const authService = {
  loginUser,
  refreshToken,
};