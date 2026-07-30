import { CreatePropertyInput } from "../property/property.interface";

export type CreateLandlordPropertyInput = CreatePropertyInput;

export type UpdateLandlordPropertyInput = Partial<CreatePropertyInput>;

export type UpdateRentalRequestStatusInput = {
  status: "APPROVED" | "REJECTED";
};