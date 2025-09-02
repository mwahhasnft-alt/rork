import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Property, PropertyFilter, PropertyType } from '@/types/property';
import { 
  SAUDI_PROPERTIES, 
  searchProperties, 
  filterPropertiesByPrice, 
  filterPropertiesByType, 
  filterPropertiesByCity, 
  sortProperties,
  getPropertyStats,
  searchPropertiesForAI
} from '@/constants/property-data';
import { trpc } from '@/lib/trpc';
import { ScrapedProperty } from '@/types/scraper';

interface PropertyContextState {
  properties: Property[];
  filteredProperties: Property[];
  searchQuery: string;
  filters: PropertyFilter;
  sortBy: 'price' | 'area' | 'date';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  selectedProperty: Property | null;
  favorites: string[];
}

interface PropertyContextActions {
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<PropertyFilter>) => void;
  setSorting: (sortBy: 'price' | 'area' | 'date', order?: 'asc' | 'desc') => void;
  selectProperty: (property: Property | null) => void;
  toggleFavorite: (propertyId: string) => void;
  searchForAI: (query: string) => Property[];
  getStats: () => ReturnType<typeof getPropertyStats>;
  clearFilters: () => void;
  refreshProperties: () => void;
}

// Convert scraped property to Property format
const convertScrapedToProperty = (scraped: ScrapedProperty, index: number): Property => {
  return {
    id: `${scraped.source}-${index}-${Date.now()}`,
    title: scraped.title,
    description: scraped.description,
    price: scraped.price?.amount || 0,
    currency: scraped.price?.currency || 'SAR',
    location: {
      city: scraped.location.city,
      district: scraped.location.district,
    },
    details: {
      bedrooms: scraped.rooms?.bedrooms || 0,
      bathrooms: scraped.rooms?.bathrooms || 0,
      area: scraped.size?.area || 0,
      parking: true, // Default assumption
      furnished: false, // Default assumption
    },
    images: scraped.images || ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'],
    type: (scraped.propertyType as PropertyType) || 'apartment',
    status: 'available' as const,
    features: scraped.features || [],
    agent: scraped.contact ? {
      id: `agent-${index}`,
      name: scraped.contact.agent || 'Unknown Agent',
      phone: scraped.contact.phone || '+966 11 000 0000',
      email: scraped.contact.email || 'agent@example.com',
    } : undefined,
    createdAt: scraped.scrapedAt || new Date(),
    updatedAt: scraped.scrapedAt || new Date(),
  };
};

const useCreatePropertyService = () => {
  const [state, setState] = useState<PropertyContextState>({
    properties: SAUDI_PROPERTIES, // Start with static data as fallback
    filteredProperties: SAUDI_PROPERTIES,
    searchQuery: '',
    filters: {},
    sortBy: 'date',
    sortOrder: 'desc',
    isLoading: true, // Start with loading true
    selectedProperty: null,
    favorites: [],
  });
  
  // Fetch scraped properties from backend
  const scrapedPropertiesQuery = trpc.scraping.getProperties.useQuery(
    { limit: 100, offset: 0 },
    {
      retry: 2,
      retryDelay: 1000,
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    }
  );
  
  // Update properties when scraped data is available
  useEffect(() => {
    if (scrapedPropertiesQuery.data?.success && scrapedPropertiesQuery.data.properties.length > 0) {
      console.log('Using scraped properties:', scrapedPropertiesQuery.data.properties.length);
      const scrapedProperties = scrapedPropertiesQuery.data.properties;
      
      // Convert scraped properties to Property format
      const convertedProperties: Property[] = scrapedProperties.map((scraped: any, index: number) => {
        // Handle both scraped property format and existing property format
        if (scraped.price && typeof scraped.price === 'object' && scraped.price.amount !== undefined) {
          // This is a scraped property, convert it
          return convertScrapedToProperty(scraped, index);
        } else {
          // This is already in Property format, use as is
          return scraped as Property;
        }
      });
      
      setState(prev => ({
        ...prev,
        properties: convertedProperties,
        filteredProperties: convertedProperties,
        isLoading: false
      }));
    } else if (!scrapedPropertiesQuery.isLoading) {
      // If no scraped data available, use static data
      console.log('Using static properties as fallback');
      setState(prev => ({
        ...prev,
        properties: SAUDI_PROPERTIES,
        filteredProperties: SAUDI_PROPERTIES,
        isLoading: false
      }));
    }
  }, [scrapedPropertiesQuery.data, scrapedPropertiesQuery.isLoading]);

  const updateState = useCallback((updates: Partial<PropertyContextState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(() => {
    let results = [...state.properties]; // Use current properties instead of static data

    // Apply search query
    if (state.searchQuery.trim()) {
      results = searchProperties(results, state.searchQuery);
    }

    // Apply filters
    if (state.filters.type && state.filters.type.length > 0) {
      results = filterPropertiesByType(results, state.filters.type);
    }

    if (state.filters.location?.cities && state.filters.location.cities.length > 0) {
      results = filterPropertiesByCity(results, state.filters.location.cities);
    }

    if (state.filters.priceRange) {
      results = filterPropertiesByPrice(
        results, 
        state.filters.priceRange.min, 
        state.filters.priceRange.max
      );
    }

    if (state.filters.bedrooms && state.filters.bedrooms.length > 0) {
      results = results.filter(property => 
        property.details.bedrooms && 
        state.filters.bedrooms!.includes(property.details.bedrooms)
      );
    }

    if (state.filters.bathrooms && state.filters.bathrooms.length > 0) {
      results = results.filter(property => 
        property.details.bathrooms && 
        state.filters.bathrooms!.includes(property.details.bathrooms)
      );
    }

    if (state.filters.areaRange) {
      results = results.filter(property => 
        property.details.area >= state.filters.areaRange!.min && 
        property.details.area <= state.filters.areaRange!.max
      );
    }

    if (state.filters.furnished !== undefined) {
      results = results.filter(property => 
        property.details.furnished === state.filters.furnished
      );
    }

    if (state.filters.parking !== undefined) {
      results = results.filter(property => 
        property.details.parking === state.filters.parking
      );
    }

    if (state.filters.features && state.filters.features.length > 0) {
      results = results.filter(property => 
        state.filters.features!.some(feature => 
          property.features.some(pFeature => 
            pFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    results = sortProperties(results, state.sortBy, state.sortOrder);

    updateState({ filteredProperties: results });
  }, [state.searchQuery, state.filters, state.sortBy, state.sortOrder, state.properties, updateState]);

  // Memoized filtered properties
  useMemo(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const setSearchQuery = useCallback((query: string) => {
    updateState({ searchQuery: query });
  }, [updateState]);

  const setFilters = useCallback((newFilters: Partial<PropertyFilter>) => {
    updateState({ 
      filters: { ...state.filters, ...newFilters } 
    });
  }, [state.filters, updateState]);

  const setSorting = useCallback((sortBy: 'price' | 'area' | 'date', order: 'asc' | 'desc' = 'desc') => {
    updateState({ sortBy, sortOrder: order });
  }, [updateState]);

  const selectProperty = useCallback((property: Property | null) => {
    updateState({ selectedProperty: property });
  }, [updateState]);

  const toggleFavorite = useCallback((propertyId: string) => {
    const newFavorites = state.favorites.includes(propertyId)
      ? state.favorites.filter(id => id !== propertyId)
      : [...state.favorites, propertyId];
    
    updateState({ favorites: newFavorites });
  }, [state.favorites, updateState]);

  const searchForAI = useCallback((query: string): Property[] => {
    return searchPropertiesForAI(query);
  }, []);

  const getStats = useCallback(() => {
    return getPropertyStats(state.filteredProperties);
  }, [state.filteredProperties]);
  
  const refreshProperties = useCallback(() => {
    scrapedPropertiesQuery.refetch();
  }, [scrapedPropertiesQuery]);

  const clearFilters = useCallback(() => {
    updateState({ 
      filters: {},
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, [updateState]);

  const actions: PropertyContextActions = {
    setSearchQuery,
    setFilters,
    setSorting,
    selectProperty,
    toggleFavorite,
    searchForAI,
    getStats,
    clearFilters,
    refreshProperties,
  };

  return {
    ...state,
    ...actions,
  };
};

export const [PropertyProvider, useProperties] = createContextHook(useCreatePropertyService);