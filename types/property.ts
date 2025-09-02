export type PropertyType = 'apartment' | 'villa' | 'office' | 'land' | 'commercial';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    city: string;
    district: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  details: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    floor?: number;
    totalFloors?: number;
    parking?: boolean;
    furnished?: boolean;
    yearBuilt?: number;
  };
  images: string[];
  type: PropertyType;
  status: 'available' | 'sold' | 'rented' | 'pending';
  features: string[];
  agent?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilter {
  type?: PropertyType[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    cities: string[];
    districts: string[];
  };
  bedrooms?: number[];
  bathrooms?: number[];
  areaRange?: {
    min: number;
    max: number;
  };
  features?: string[];
  furnished?: boolean;
  parking?: boolean;
}

export interface PropertySearchParams {
  query?: string;
  filters?: PropertyFilter;
  sortBy?: 'price' | 'area' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}