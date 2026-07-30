export interface CreatePropertyOverviewInput {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  availableFrom: string;
  status: string;
  yearBuilt: number;
  depositAmount: number;
  leaseTerm: string;
  petPolicy: string;
  parkingType: string;
}

export interface CreatePropertyInput {
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  location: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
  mainImage: string;
  images: string[];
  amenities: string[];
  categoryId: string;
  overview?: CreatePropertyOverviewInput;
}

export type PropertyListQuery = {
  search?: string;
  city?: string;
  state?: string;
  location?: string;
  category?: string;

  minPrice?: number;
  maxPrice?: number;

  bedrooms?: number;
  bathrooms?: number;

  featured?: boolean;

  sort?: "newest" | "price_asc" | "price_desc" | "rating";

  page?: number;
  limit?: number;
};