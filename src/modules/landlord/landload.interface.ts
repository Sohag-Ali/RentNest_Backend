export type CreateLandlordPropertyInput = {
    categoryName: string;
    title: string;
    description: string;
    location: string;
    price: number;
    amenities?: string[];
    isAvailable?: boolean;
};


export type UpdateLandlordPropertyInput = {
    categoryName?: string;
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    amenities?: string[];
    isAvailable?: boolean;
};

export type UpdateRentalRequestStatusInput = {
    status: "APPROVED" | "REJECTED";
};