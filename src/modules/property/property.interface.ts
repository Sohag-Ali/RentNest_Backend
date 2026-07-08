export type PropertyListQuery = {
    location?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "newest" | "price_asc" | "price_desc";
    page?: number;
    limit?: number;
};