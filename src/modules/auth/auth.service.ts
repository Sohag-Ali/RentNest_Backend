import { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import { ILoginUser } from "./auth.interface";
import { Role } from "../../../generated/prisma/enums";

const googleClient = new OAuth2Client(config.google_client_id);

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

  if (user.password === null) {
    throw new AppError(400, "This account uses Google login. Please continue with Google.");
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

const googleLoginIntoDB = async (credential: string) => {
  let googlePayload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google_client_id,
    });
    googlePayload = ticket.getPayload();
  } catch (error: any) {
    throw new AppError(401, "Invalid Google credential.");
  }

  if (!googlePayload || !googlePayload.email || !googlePayload.sub || !googlePayload.email_verified) {
    throw new AppError(401, "Invalid Google credential or unverified email.");
  }

  const email = googlePayload.email!;
  const sub = googlePayload.sub!;
  const name = googlePayload.name;
  const picture = googlePayload.picture;


  // 1. Check if user exists by googleId
  let user = await prisma.user.findUnique({
    where: {
      googleId: sub,
    },
  });

  if (user) {
    if (user.status === "BANNED") {
      throw new AppError(403, "This user is banned. Please contact support for assistance.");
    }
    if (user.status === "INACTIVE") {
      throw new AppError(403, "This user is inactive. Please contact support for assistance.");
    }
  } else {
    // 2. Check if user exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUserByEmail) {
      if (existingUserByEmail.status === "BANNED") {
        throw new AppError(403, "This user is banned. Please contact support for assistance.");
      }
      if (existingUserByEmail.status === "INACTIVE") {
        throw new AppError(403, "This user is inactive. Please contact support for assistance.");
      }

      // Link googleId to existing user while preserving role, password, name, profile info
      user = await prisma.user.update({
        where: {
          id: existingUserByEmail.id,
        },
        data: {
          googleId: sub,
        },
      });
    } else {
      // 3. First Google Login - Create new User with forced role TENANT
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0] || email,
          email,
          avatar: picture || null,
          googleId: sub,
          password: null,
          role: Role.TENANT,
        },
      });
    }
  }

  if (!user) {
    throw new AppError(500, "Failed to authenticate user.");
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
  googleLoginIntoDB,
  refreshToken,
};