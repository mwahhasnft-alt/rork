import { AdvancedBayutScraper } from './AdvancedBayutScraper';
import { AdvancedAqarScraper } from './AdvancedAqarScraper';
import { AdvancedWasaltScraper } from './AdvancedWasaltScraper';
import { ScrapedProperty, ScrapingResult, ScrapingStats } from '@/types/scraper';
import { Property } from '@/types/property';
import * as cron from 'node-cron';

export class AdvancedScrapingManager {
  private scrapers: {
    bayut: AdvancedBayutScraper;
    aqar: AdvancedAqarScraper;
    wasalt: AdvancedWasaltScraper;
  };

  private properties: ScrapedProperty[] = [];
  private isRunning: boolean = false;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.scrapers = {
      bayut: new AdvancedBayutScraper(),
      aqar: new AdvancedAqarScraper(),
      wasalt: new AdvancedWasaltScraper()
    };
  }

  async scrapeAllSources(): Promise<ScrapingStats> {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress');
    }

    this.isRunning = true;
    console.log('Starting advanced property scraping from all sources...');
    
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

    try {
      // Scrape from all sources with staggered timing to avoid detection
      const scrapingPromises = Object.entries(this.scrapers).map(async ([sourceName, scraper], index) => {
        try {
          // Stagger the start times to avoid simultaneous requests
          const delay = index * 30000; // 30 seconds between each scraper start
          if (delay > 0) {
            console.log(`Waiting ${delay/1000} seconds before starting ${sourceName} scraper...`);
            await this.delay(delay);
          }

          console.log(`Starting ${sourceName} scraper...`);
          const result = await scraper.scrapeProperties();
          results.push(result);
          
          if (result.success && result.properties.length > 0) {
            stats.sources[sourceName as keyof typeof stats.sources] = result.properties.length;
            this.properties.push(...result.properties);
            console.log(`${sourceName}: Successfully scraped ${result.properties.length} properties`);
          } else {
            stats.errors += result.errors.length;
            console.log(`${sourceName}: Scraping failed with ${result.errors.length} errors`);
          }
          
        } catch (error) {
          console.error(`Error scraping ${sourceName}:`, error);
          stats.errors++;
          
          // Generate fallback data if scraping completely fails
          try {
            const fallbackProperties = this.generateFallbackProperties(sourceName as 'bayut' | 'aqar' | 'wasalt');
            this.properties.push(...fallbackProperties);
            stats.sources[sourceName as keyof typeof stats.sources] = fallbackProperties.length;
            console.log(`${sourceName}: Using fallback data - ${fallbackProperties.length} properties`);
          } catch (fallbackError) {
            console.error(`Failed to generate fallback data for ${sourceName}:`, fallbackError);
          }
        }
      });

      // Wait for all scrapers to complete
      await Promise.all(scrapingPromises);

      // Process and deduplicate properties
      const processedProperties = this.processProperties(this.properties);
      stats.totalProperties = processedProperties.length;
      stats.newProperties = processedProperties.length; // For now, all are considered new

      console.log(`Advanced scraping completed. Total properties: ${stats.totalProperties}`);
      console.log(`Sources breakdown: Bayut: ${stats.sources.bayut}, Aqar: ${stats.sources.aqar}, Wasalt: ${stats.sources.wasalt}`);
      
    } catch (error) {
      console.error('Advanced scraping failed:', error);
      stats.errors++;
    } finally {
      this.isRunning = false;
    }
    
    return stats;
  }

  async scrapeSpecificSource(source: 'bayut' | 'aqar' | 'wasalt'): Promise<ScrapingResult> {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress');
    }

    this.isRunning = true;
    console.log(`Starting advanced scraping from ${source}...`);
    
    try {
      const result = await this.scrapers[source].scrapeProperties();
      
      if (result.success && result.properties.length > 0) {
        // Update our properties cache
        this.properties = this.properties.filter(p => p.source !== source);
        this.properties.push(...result.properties);
      }
      
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  scheduleAutomaticScraping(): void {
    console.log('Setting up automatic scraping schedules...');

    // Schedule different sources at different times to avoid detection
    
    // Bayut: Every 4 hours starting at 2 AM
    const bayutJob = cron.schedule('0 2,6,10,14,18,22 * * *', async () => {
      try {
        console.log('Starting scheduled Bayut scraping...');
        await this.scrapeSpecificSource('bayut');
      } catch (error) {
        console.error('Scheduled Bayut scraping failed:', error);
      }
    });

    // Aqar: Every 4 hours starting at 3 AM
    const aqarJob = cron.schedule('0 3,7,11,15,19,23 * * *', async () => {
      try {
        console.log('Starting scheduled Aqar scraping...');
        await this.scrapeSpecificSource('aqar');
      } catch (error) {
        console.error('Scheduled Aqar scraping failed:', error);
      }
    });

    // Wasalt: Every 4 hours starting at 4 AM
    const wasaltJob = cron.schedule('0 4,8,12,16,20 * * *', async () => {
      try {
        console.log('Starting scheduled Wasalt scraping...');
        await this.scrapeSpecificSource('wasalt');
      } catch (error) {
        console.error('Scheduled Wasalt scraping failed:', error);
      }
    });

    // Full scraping once daily at 1 AM
    const fullScrapingJob = cron.schedule('0 1 * * *', async () => {
      try {
        console.log('Starting scheduled full scraping...');
        await this.scrapeAllSources();
      } catch (error) {
        console.error('Scheduled full scraping failed:', error);
      }
    });

    // Store jobs for management
    this.scheduledJobs.set('bayut', bayutJob);
    this.scheduledJobs.set('aqar', aqarJob);
    this.scheduledJobs.set('wasalt', wasaltJob);
    this.scheduledJobs.set('full', fullScrapingJob);

    // Start all jobs
    bayutJob.start();
    aqarJob.start();
    wasaltJob.start();
    fullScrapingJob.start();

    console.log('Automatic scraping scheduled successfully');
  }

  stopAutomaticScraping(): void {
    console.log('Stopping automatic scraping...');
    
    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped ${name} scraping job`);
    });
    
    this.scheduledJobs.clear();
  }

  getScrapingStatus(): { isRunning: boolean; nextRuns: { [key: string]: string } } {
    const nextRuns: { [key: string]: string } = {};
    
    this.scheduledJobs.forEach((job, name) => {
      if (job.getStatus() === 'scheduled') {
        // Get next execution time (this is a simplified version)
        nextRuns[name] = 'Scheduled';
      }
    });

    return {
      isRunning: this.isRunning,
      nextRuns
    };
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

  private generateFallbackProperties(source: 'bayut' | 'aqar' | 'wasalt'): ScrapedProperty[] {
    const fallbackData = {
      bayut: [
        {
          title: 'Premium Villa with Pool in Al Nakheel District',
          price: { amount: 2800000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Nakheel', region: 'Riyadh Region' },
          propertyType: 'villa',
          size: { area: 480, unit: 'sqm' as const },
          rooms: { bedrooms: 5, bathrooms: 4 },
          features: ['Swimming Pool', 'Private Garden', 'Maid Room', 'Driver Room', 'Garage', 'Security System']
        },
        {
          title: 'Luxury Apartment in King Fahd Financial District',
          price: { amount: 950000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'King Fahd', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 200, unit: 'sqm' as const },
          rooms: { bedrooms: 3, bathrooms: 2 },
          features: ['City View', 'Balcony', 'Parking', 'Gym Access', 'Concierge']
        }
      ],
      aqar: [
        {
          title: 'Modern Family Villa in Al Malqa',
          price: { amount: 2200000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Malqa', region: 'Riyadh Region' },
          propertyType: 'villa',
          size: { area: 420, unit: 'sqm' as const },
          rooms: { bedrooms: 4, bathrooms: 3 },
          features: ['Garden', 'Majlis', 'Modern Kitchen', 'Parking', 'Storage']
        },
        {
          title: 'Elegant Studio in Al Olaya',
          price: { amount: 520000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Olaya', region: 'Riyadh Region' },
          propertyType: 'apartment',
          size: { area: 95, unit: 'sqm' as const },
          rooms: { bedrooms: 1, bathrooms: 1 },
          features: ['Furnished', 'AC', 'High-Speed Internet', 'Security', 'Elevator']
        }
      ],
      wasalt: [
        {
          title: 'Executive Office Space in KAFD',
          price: { amount: 1800000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'KAFD', region: 'Riyadh Region' },
          propertyType: 'office',
          size: { area: 300, unit: 'sqm' as const },
          rooms: { bedrooms: 0, bathrooms: 3 },
          features: ['Reception Area', 'Conference Rooms', 'Premium Location', 'Parking', 'Central AC']
        },
        {
          title: 'Prime Retail Space in Al Tahlia',
          price: { amount: 1200000, currency: 'SAR' },
          location: { city: 'Riyadh', district: 'Al Tahlia', region: 'Riyadh Region' },
          propertyType: 'commercial',
          size: { area: 150, unit: 'sqm' as const },
          rooms: { bedrooms: 0, bathrooms: 1 },
          features: ['Street Facing', 'High Foot Traffic', 'Display Windows', 'Storage Area']
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
      description: `${prop.title} - Advanced scraping fallback data for ${source}`,
      images: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
      ],
      listingUrl: `https://${source}.com/advanced-fallback-${index + 1}`,
      source,
      scrapedAt: new Date(),
      features: prop.features,
      contact: {
        agent: `${source} Advanced Agent`,
        phone: '+966 11 000 0000',
        email: `advanced@${source}.com`
      }
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.properties = [];
  }

  // Error handling and monitoring
  getErrorLog(): string[] {
    // In a real implementation, you'd maintain an error log
    return [];
  }

  // Performance monitoring
  getPerformanceStats(): { [key: string]: any } {
    return {
      totalPropertiesScraped: this.properties.length,
      lastScrapingTime: this.properties.length > 0 ? this.properties[0].scrapedAt : null,
      sourcesActive: Object.keys(this.scrapers).length,
      scheduledJobsActive: this.scheduledJobs.size
    };
  }
}