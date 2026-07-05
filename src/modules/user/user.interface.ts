import { Role } from "../../../generated/prisma/enums";

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: Role
}