import { PaymentStatus } from "../../../generated/prisma/enums";
import { CreatePropertyInput } from "../property/property.interface";

export type CreateLandlordPropertyInput = CreatePropertyInput;

export type UpdateLandlordPropertyInput = Partial<CreatePropertyInput>;

export type UpdateRentalRequestStatusInput = {
  status: "APPROVED" | "REJECTED";
};

export type GetLandlordRentedPropertiesQuery = {
  search?: string;
  city?: string;
  category?: string;
  paymentStatus?: PaymentStatus;
  sort?: "newest" | "paidDateDesc";
  page?: number;
  limit?: number;
};