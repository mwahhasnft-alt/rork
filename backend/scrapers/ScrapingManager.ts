import { BayutScraper } from './BayutScraper';
import { AqarScraper } from './AqarScraper';
import { WasaltScraper } from './WasaltScraper';
import { ScrapedProperty, ScrapingResult, ScrapingStats } from '@/types/scraper';
import { Property } from '@/types/property';

export class ScrapingManager {
  private scrapers: {
    bayut: BayutScraper;
    aqar: AqarScraper;
    wasalt: WasaltScraper;
  };

  private properties: ScrapedProperty[] = [];

  constructor() {
    this.scrapers = {
      bayut: new BayutScraper(),
      aqar: new AqarScraper(),
      wasalt: new WasaltScraper()
    };
    
    // Initialize with some sample data immediately
    this.initializeWithSampleData();
  }
  
  private initializeWithSampleData(): void {
    try {
      console.log('Initializing ScrapingManager with sample data...');
      
      // Generate sample data for each source
      const bayutSample = this.generateFallbackProperties('bayut');
      const aqarSample = this.generateFallbackProperties('aqar');
      const wasaltSample = this.generateFallbackProperties('wasalt');
      
      this.properties = [...bayutSample, ...aqarSample, ...wasaltSample];
      
      console.log(`ScrapingManager initialized with ${this.properties.length} sample properties`);
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
      this.properties = [];
    }
  }

  async scrapeAllSources(): Promise<ScrapingStats> {
    console.log('Starting property scraping from all sources...');
    
    const results: ScrapingResult[] = [];
    const stats: ScrapingStats = {
      totalProperties: 0,
      newProperties: 0,
      updatedProperties: 0,
      errors: 0,
      lastRun: new Date(),
      sources: {
        bayut: 0,
        aqar: 0,
        wasalt: 0
      }
    };

    // Clear previous properties to avoid duplicates
    this.properties = [];

    // Scrape from all sources
    for (const [sourceName, scraper] of Object.entries(this.scrapers)) {
      try {
        console.log(`Scraping from ${sourceName}...`);
        const result = await scraper.scrapeProperties();
        results.push(result);
        
        if (result.success && result.properties.length > 0) {
          stats.sources[sourceName as keyof typeof stats.sources] = result.properties.length;
          this.properties.push(...result.properties);
        } else {
          stats.errors += result.errors.length;
          // Even if scraping failed, we might have some properties from mock data
          if (result.properties.length > 0) {
            stats.sources[sourceName as keyof typeof stats.sources] = result.properties.length;
            this.properties.push(...result.properties);
          }
        }
        
        console.log(`${sourceName}: Found ${result.properties.length} properties, ${result.errors.length} errors`);
      } catch (error) {
        console.error(`Error scraping ${sourceName}:`, error);
        stats.errors++;
        
        // Generate fallback mock data if scraping completely fails
        try {
          const fallbackProperties = this.generateFallbackProperties(sourceName as 'bayut' | 'aqar' | 'wasalt');
          this.properties.push(...fallbackProperties);
          stats.sources[sourceName as keyof typeof stats.sources] = fallbackProperties.length;
          console.log(`${sourceName}: Using fallback data - ${fallbackProperties.length} properties`);
        } catch (fallbackError) {
          console.error(`Failed to generate fallback data for ${sourceName}:`, fallbackError);
        }
      }
    }

    // Process and deduplicate properties
    const processedProperties = this.processProperties(this.properties);
    stats.totalProperties = processedProperties.length;
    stats.newProperties = processedProperties.length; // For now, all are considered new

    console.log(`Scraping completed. Total properties: ${stats.totalProperties}`);
    
    return stats;
  }

  private processProperties(scrapedProperties: ScrapedProperty[]): Property[] {
    const processedProperties: Property[] = [];
    const seenUrls = new Set<string>();

    for (const scrapedProp of scrapedProperties) {
      // Skip duplicates based on URL
      if (seenUrls.has(scrapedProp.listingUrl)) {
        continue;
      }
      seenUrls.add(scrapedProp.listingUrl);

      // Convert ScrapedProperty to Property format
      const property: Property = {
        id: this.generatePropertyId(scrapedProp),
        title: scrapedProp.title,
        description: scrapedProp.description,
        price: scrapedProp.price.amount,
        currency: scrapedProp.price.currency,
        location: {
          city: scrapedProp.location.city,
          district: scrapedProp.location.district,
          coordinates: undefined // Will be added later with geocoding
        },
        details: {
          bedrooms: scrapedProp.rooms?.bedrooms,
          bathrooms: scrapedProp.rooms?.bathrooms,
          area: scrapedProp.size?.area || 0,
          parking: scrapedProp.features?.some(f => f.toLowerCase().includes('parking')) || false,
          furnished: scrapedProp.features?.some(f => f.toLowerCase().includes('furnished')) || false
        },
        images: scrapedProp.images,
        type: this.mapPropertyType(scrapedProp.propertyType),
        status: 'available',
        features: scrapedProp.features || [],
        agent: scrapedProp.contact ? {
          id: 'scraped-agent',
          name: scrapedProp.contact.agent || 'Unknown',
          phone: scrapedProp.contact.phone || '',
          email: scrapedProp.contact.email || ''
        } : undefined,
        createdAt: scrapedProp.scrapedAt,
        updatedAt: scrapedProp.scrapedAt
      };

      processedProperties.push(property);
    }

    return processedProperties;
  }

  private generatePropertyId(property: ScrapedProperty): string {
    // Generate a unique ID based on source and URL
    const hash = this.simpleHash(property.listingUrl);
    return `${property.source}-${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private mapPropertyType(scrapedType: string): 'apartment' | 'villa' | 'office' | 'land' | 'commercial' {
    const type = scrapedType.toLowerCase();
    if (type.includes('villa') || type.includes('house')) return 'villa';
    if (type.includes('office')) return 'office';
    if (type.includes('land') || type.includes('plot')) return 'land';
    if (type.includes('commercial') || type.includes('shop') || type.includes('warehouse')) return 'commercial';
    return 'apartment'; // default
  }

  getScrapedProperties(): Property[] {
    return this.processProperties(this.properties);
  }

  async scrapeSpecificSource(source: 'bayut' | 'aqar' | 'wasalt'): Promise<ScrapingResult> {
    console.log(`Scraping from ${source}...`);
    
    try {
      const result = await this.scrapers[source].scrapeProperties();
      
      // Update our properties cache with new data from this source
      if (result.success && result.properties.length > 0) {
        // Remove old properties from this source
        this.properties = this.properties.filter(p => p.source !== source);
        // Add new properties
        this.properties.push(...result.properties);
      }
      
      return result;
    } catch (error) {
      console.error(`Error scraping ${source}:`, error);
      
      // Return fallback data if scraping fails
      const fallbackProperties = this.generateFallbackProperties(source);
      
      // Update cache with fallback data
      this.properties = this.properties.filter(p => p.source !== source);
      this.properties.push(...fallbackProperties);
      
      return {
        success: true, // Consider fallback as success
        properties: fallbackProperties,
        errors: [`Scraping failed, using fallback data: ${error}`],
        source,
        scrapedAt: new Date(),
        totalFound: fallbackProperties.length
      };
    }
  }

  private generateFallbackProperties(source: 'bayut' | 'aqar' | 'wasalt'): ScrapedProperty[] {
    const fallbackData = {
      bayut: [
        {
          title: 'Luxury Villa with Pool in Al Nakheel',
          price: { amount: 2500000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Nakheel', region: 'Riyadh Region' },
          propertyType: 'villa',
          size: { area: 450, unit: 'sqm' as const },
          rooms: { bedrooms: 5, bathrooms: 4 },
          features: ['Swimming Pool', 'Garden', 'Maid Room', 'Driver Room', 'Garage']
        },
        {
          title: 'Modern Apartment in King Fahd District',
          price: { amount: 850000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'King Fahd', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 180, unit: 'sqm' as const },
          rooms: { bedrooms: 3, bathrooms: 2 },
          features: ['Balcony', 'Parking', 'Gym', 'Security']
        },
        {
          title: 'Spacious Family Villa in Al Olaya',
          price: { amount: 3200000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Olaya', region: 'Riyadh Region' },
          propertyType: 'villa',
          size: { area: 520, unit: 'sqm' as const },
          rooms: { bedrooms: 6, bathrooms: 5 },
          features: ['Private Garden', 'Majlis', 'Kitchen', 'Laundry Room']
        }
      ],
      aqar: [
        {
          title: 'Cozy Studio in Al Malqa',
          price: { amount: 450000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Malqa', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 85, unit: 'sqm' as const },
          rooms: { bedrooms: 1, bathrooms: 1 },
          features: ['Furnished', 'AC', 'Internet', 'Parking']
        },
        {
          title: 'Family Apartment in Al Yasmin',
          price: { amount: 720000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Yasmin', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 160, unit: 'sqm' as const },
          rooms: { bedrooms: 3, bathrooms: 2 },
          features: ['Balcony', 'Storage', 'Elevator', 'Security']
        },
        {
          title: 'Penthouse in Al Sahafa',
          price: { amount: 1800000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Sahafa', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 280, unit: 'sqm' as const },
          rooms: { bedrooms: 4, bathrooms: 3 },
          features: ['Terrace', 'City View', 'Premium Finishes', 'Private Elevator']
        }
      ],
      wasalt: [
        {
          title: 'Prime Office Space in KAFD',
          price: { amount: 1500000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'KAFD', region: 'Riyadh Region' },
          propertyType: 'office',
          size: { area: 250, unit: 'sqm' as const },
          rooms: { bedrooms: 0, bathrooms: 2 },
          features: ['Reception Area', 'Meeting Rooms', 'Parking', 'Central AC']
        },
        {
          title: 'Retail Shop in Al Tahlia',
          price: { amount: 900000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Tahlia', region: 'Riyadh Region' },
          propertyType: 'commercial',
          size: { area: 120, unit: 'sqm' as const },
          rooms: { bedrooms: 0, bathrooms: 1 },
          features: ['Street Facing', 'High Traffic', 'Storage', 'Display Windows']
        },
        {
          title: 'Warehouse in Industrial City',
          price: { amount: 2200000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Industrial City', region: 'Riyadh Region' },
          propertyType: 'commercial',
          size: { area: 800, unit: 'sqm' as const },
          rooms: { bedrooms: 0, bathrooms: 2 },
          features: ['Loading Dock', 'High Ceiling', 'Office Space', 'Security']
        }
      ]
    };

    return fallbackData[source].map((prop, index) => ({
      title: prop.title,
      location: prop.location,
      price: prop.price,
      propertyType: prop.propertyType,
      size: prop.size,
      rooms: prop.rooms,
      description: `${prop.title} - Sample data for ${source}`,
      images: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
      ],
      listingUrl: `https://${source}.com/sample-${Date.now()}-${index + 1}`,
      source,
      scrapedAt: new Date(),
      features: prop.features,
      contact: {
        agent: `${source} Sample Agent`,
        phone: '+966 11 123 4567',
        email: `agent@${source}.com`
      }
    }));
  }

  clearCache(): void {
    this.properties = [];
  }
}