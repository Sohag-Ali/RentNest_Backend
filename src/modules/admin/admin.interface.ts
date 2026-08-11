import { RentalStatus, Role, UserStatus } from "../../../generated/prisma/enums";

export type AdminUsersQuery = {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
};

export type AdminPropertiesQuery = {
    page?: number;
    limit?: number;
    location?: string;
    category?: string;
    availability?: boolean;
    sort?: "newest" | "oldest" | "price";
};

export type AdminRentalsQuery = {
    page?: number;
    limit?: number;
    status?: RentalStatus;
};

export type AdminUpdateUserStatusInput = {
    status: UserStatus;
};

export type AdminAnalyticsQuery = {
    period?: "7d" | "30d" | "90d" | "all";
};