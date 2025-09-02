export interface ScrapedProperty {
  title: string;
  location: {
    city: string;
    district: string;
    region?: string;
  };
  price: {
    amount: number;
    currency: string;
    period?: 'monthly' | 'yearly' | 'sale';
  };
  propertyType: string;
  size?: {
    area: number;
    unit: 'sqm' | 'sqft';
  };
  rooms?: {
    bedrooms?: number;
    bathrooms?: number;
  };
  description: string;
  images: string[];
  contact?: {
    phone?: string;
    email?: string;
    agent?: string;
  };
  listingUrl: string;
  source: 'bayut' | 'aqar' | 'wasalt' | 'imported' | 'sample' | 'srem';
  scrapedAt: Date;
  features?: string[];
}

export interface ScrapingResult {
  success: boolean;
  properties: ScrapedProperty[];
  errors: string[];
  source: string;
  scrapedAt: Date;
  totalFound: number;
}

export interface ScrapingConfig {
  maxPages: number;
  delayBetweenRequests: number;
  userAgent: string;
  timeout: number;
  retryAttempts: number;
}

export interface ScrapingStats {
  totalProperties: number;
  newProperties: number;
  updatedProperties: number;
  errors: number;
  lastRun: Date;
  sources: {
    bayut: number;
    aqar: number;
    wasalt: number;
  };
}