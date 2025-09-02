import { BaseScraper } from './BaseScraper';
import { ScrapedProperty, ScrapingResult } from '@/types/scraper';
import * as cheerio from 'cheerio';

export class AqarScraper extends BaseScraper {
  constructor() {
    super('aqar', {
      maxPages: 10,
      delayBetweenRequests: 3000,
    });
  }

  async scrapeProperties(): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      properties: [],
      errors: [],
      source: 'aqar',
      scrapedAt: new Date(),
      totalFound: 0
    };

    try {
      console.log('Starting Aqar.fm scraping...');
      
      // Generate mock data for demo
      const mockProperties = this.generateMockProperties();
      result.properties.push(...mockProperties);
      
      // Simulate processing time
      await this.delay(1500);
      
      result.success = result.properties.length > 0;
      result.totalFound = result.properties.length;
      
      console.log(`Aqar scraping completed: ${result.properties.length} properties found`);
      
    } catch (error) {
      console.error('Aqar scraping failed:', error);
      result.errors.push(`General scraping error: ${error}`);
    }

    return result;
  }

  private generateMockProperties(): ScrapedProperty[] {
    const mockProperties: ScrapedProperty[] = [];
    
    const sampleProperties = [
      {
        title: 'Spacious Family Villa in Al Malqa',
        price: { amount: 1800000, currency: 'SAR' },
        location: { city: 'Riyadh', district: 'Al Malqa', region: 'Riyadh Region' },
        propertyType: 'villa',
        size: { area: 380, unit: 'sqm' as const },
        rooms: { bedrooms: 4, bathrooms: 3 },
        features: ['Garden', 'Parking', 'Storage Room', 'Balcony']
      },
      {
        title: 'Modern Studio in Al Olaya',
        price: { amount: 450000, currency: 'SAR' },
        location: { city: 'Riyadh', district: 'Al Olaya', region: 'Riyadh Region' },
        propertyType: 'apartment',
        size: { area: 85, unit: 'sqm' as const },
        rooms: { bedrooms: 1, bathrooms: 1 },
        features: ['Furnished', 'AC', 'Internet', 'Security']
      }
    ];

    sampleProperties.forEach((prop, index) => {
      const property: ScrapedProperty = {
        title: prop.title,
        location: prop.location,
        price: prop.price,
        propertyType: prop.propertyType,
        size: prop.size,
        rooms: prop.rooms,
        description: `${prop.title}. Located in ${prop.location.district}, this property is perfect for families.`,
        images: [
          `https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
          `https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`
        ],
        listingUrl: `https://sa.aqar.fm/property/mock-${index + 1}`,
        source: 'aqar',
        scrapedAt: new Date(),
        features: prop.features,
        contact: {
          agent: 'Aqar Agent',
          phone: '+966 11 987 6543',
          email: 'agent@aqar.fm'
        }
      };
      
      mockProperties.push(property);
    });

    return mockProperties;
  }

  private async scrapeFromUrl(url: string, result: ScrapingResult): Promise<void> {
    const $ = await this.fetchPage(url);
    if (!$) {
      result.errors.push(`Failed to load page: ${url}`);
      return;
    }

    // Common selectors for Aqar.fm
    const propertySelectors = [
      '.property-item',
      '.listing-item',
      '.ad-item',
      '[class*=\"property\"]',
      '[class*=\"listing\"]'
    ];

    let propertyElements: cheerio.Cheerio<any> | null = null;
    
    for (const selector of propertySelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        propertyElements = elements;
        console.log(`Found ${elements.length} properties using selector: ${selector}`);
        break;
      }
    }

    if (!propertyElements || propertyElements.length === 0) {
      // Fallback: look for any elements that might contain property data
      propertyElements = $('a[href*=\"property\"], a[href*=\"ad\"]').parent();
      console.log(`Fallback: Found ${propertyElements.length} potential property elements`);
    }

    propertyElements.each((index: number, element: any) => {
      try {
        const property = this.extractPropertyFromElement($, $(element), url);
        if (property) {
          result.properties.push(property);
        }
      } catch (error) {
        console.error(`Error extracting property ${index}:`, error);
        result.errors.push(`Property extraction error: ${error}`);
      }
    });
  }

  private extractPropertyFromElement($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>, baseUrl: string): ScrapedProperty | null {
    try {
      // Extract title
      const titleSelectors = ['h2', 'h3', '.title', '.ad-title', '[class*=\"title\"]'];
      let title = '';
      for (const selector of titleSelectors) {
        const titleEl = element.find(selector).first();
        if (titleEl.length && titleEl.text().trim()) {
          title = this.cleanText(titleEl.text());
          break;
        }
      }

      if (!title) return null;

      // Extract price
      const priceSelectors = ['.price', '.ad-price', '[class*=\"price\"]'];
      let priceText = '';
      for (const selector of priceSelectors) {
        const priceEl = element.find(selector).first();
        if (priceEl.length && priceEl.text().trim()) {
          priceText = this.cleanText(priceEl.text());
          break;
        }
      }

      const price = this.extractPrice(priceText);

      // Extract location
      const locationSelectors = ['.location', '.ad-location', '[class*=\"location\"]', '[class*=\"address\"]'];
      let locationText = '';
      for (const selector of locationSelectors) {
        const locationEl = element.find(selector).first();
        if (locationEl.length && locationEl.text().trim()) {
          locationText = this.cleanText(locationEl.text());
          break;
        }
      }

      // Parse location (Arabic text handling)
      const locationParts = locationText.split(',').map(part => part.trim());
      const location = {
        city: this.translateCity(locationParts[locationParts.length - 1]) || 'Riyadh',
        district: locationParts[0] || 'Unknown',
        region: 'Saudi Arabia'
      };

      // Extract property type
      const typeSelectors = ['.type', '.ad-type', '[class*=\"type\"]'];
      let propertyType = 'apartment';
      for (const selector of typeSelectors) {
        const typeEl = element.find(selector).first();
        if (typeEl.length && typeEl.text().trim()) {
          propertyType = this.translatePropertyType(this.cleanText(typeEl.text().toLowerCase()));
          break;
        }
      }

      // Extract area
      const areaSelectors = ['.area', '.ad-area', '[class*=\"area\"]', '[class*=\"size\"]'];
      let areaText = '';
      for (const selector of areaSelectors) {
        const areaEl = element.find(selector).first();
        if (areaEl.length && areaEl.text().trim()) {
          areaText = this.cleanText(areaEl.text());
          break;
        }
      }

      const size = areaText ? this.extractArea(areaText) : undefined;

      // Extract rooms info
      const roomsText = element.text();
      const rooms = this.extractRooms(roomsText);

      // Extract images
      const images: string[] = [];
      element.find('img').each((_: number, img: any) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && !src.includes('placeholder')) {
          images.push(src.startsWith('http') ? src : `https://sa.aqar.fm${src}`);
        }
      });

      // Extract listing URL
      let listingUrl = '';
      const linkEl = element.find('a[href*=\"property\"], a[href*=\"ad\"]').first();
      if (linkEl.length) {
        const href = linkEl.attr('href');
        if (href) {
          listingUrl = href.startsWith('http') ? href : `https://sa.aqar.fm${href}`;
        }
      }

      const property: ScrapedProperty = {
        title,
        location,
        price,
        propertyType,
        size,
        rooms,
        description: title,
        images,
        listingUrl: listingUrl || baseUrl,
        source: 'aqar',
        scrapedAt: new Date(),
        features: []
      };

      return property;
    } catch (error) {
      console.error('Error extracting property:', error);
      return null;
    }
  }

  private translateCity(arabicCity: string): string {
    const cityMap: { [key: string]: string } = {
      'الرياض': 'Riyadh',
      'جدة': 'Jeddah',
      'الدمام': 'Dammam',
      'مكة': 'Mecca',
      'المدينة': 'Medina',
      'الطائف': 'Taif',
      'الخبر': 'Khobar',
      'الأحساء': 'Al-Ahsa'
    };
    return cityMap[arabicCity] || arabicCity;
  }

  private translatePropertyType(arabicType: string): string {
    const typeMap: { [key: string]: string } = {
      'شقة': 'apartment',
      'فيلا': 'villa',
      'بيت': 'house',
      'أرض': 'land',
      'مكتب': 'office',
      'محل': 'shop',
      'مستودع': 'warehouse'
    };
    return typeMap[arabicType] || arabicType;
  }

  async scrapePropertyDetails(url: string): Promise<ScrapedProperty | null> {
    const $ = await this.fetchPage(url);
    if (!$) return null;

    // Implementation for detailed property scraping
    return null;
  }
}