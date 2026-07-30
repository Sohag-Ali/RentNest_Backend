import { Gender, Role } from "../../../generated/prisma/client";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserProfilePayload {
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  gender?: Gender | null;
  dateOfBirth?: Date | string | null;
  occupation?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
}