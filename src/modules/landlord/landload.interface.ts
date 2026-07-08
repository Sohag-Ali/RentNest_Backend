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
    categoryId?: string;
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