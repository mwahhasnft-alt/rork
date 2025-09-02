import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedProperty, ScrapingResult, ScrapingConfig } from '@/types/scraper';

export abstract class BaseScraper {
  protected config: ScrapingConfig;
  protected source: 'bayut' | 'aqar' | 'wasalt';

  constructor(source: 'bayut' | 'aqar' | 'wasalt', config?: Partial<ScrapingConfig>) {
    this.source = source;
    this.config = {
      maxPages: 5,
      delayBetweenRequests: 2000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      timeout: 30000,
      retryAttempts: 3,
      ...config
    };
  }

  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI | null> {
    let attempts = 0;
    
    while (attempts < this.config.retryAttempts) {
      try {
        console.log(`Fetching ${url} (attempt ${attempts + 1})`);
        
        // For demo purposes, we'll simulate a successful fetch
        // In production, you would need proper proxy/scraping infrastructure
        if (url.includes('mock') || attempts === 0) {
          // Simulate network delay
          await this.delay(1000);
          
          // Return a mock HTML structure for testing
          const mockHtml = `
            <html>
              <body>
                <div class="property-card">
                  <h2>Sample Property</h2>
                  <div class="price">500,000 SAR</div>
                  <div class="location">Al Malaz, Riyadh</div>
                  <div class="area">150 sqm</div>
                  <div class="type">Apartment</div>
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800" alt="property" />
                  <a href="/property/sample-1">View Details</a>
                </div>
              </body>
            </html>
          `;
          return cheerio.load(mockHtml);
        }
        
        const response: AxiosResponse = await axios.get(url, {
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: this.config.timeout,
        });

        if (response.status === 200) {
          return cheerio.load(response.data);
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        attempts++;
        
        if (attempts < this.config.retryAttempts) {
          await this.delay(this.config.delayBetweenRequests * attempts);
        }
      }
    }
    
    return null;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\\s+/g, ' ').replace(/\\n/g, ' ');
  }

  protected extractPrice(priceText: string): { amount: number; currency: string; period?: 'monthly' | 'yearly' | 'sale' } {
    const cleanPrice = priceText.replace(/[^\\d.,]/g, '');
    const amount = parseFloat(cleanPrice.replace(/,/g, ''));
    
    let period: 'monthly' | 'yearly' | 'sale' | undefined;
    if (priceText.includes('شهر') || priceText.includes('month')) {
      period = 'monthly';
    } else if (priceText.includes('سنة') || priceText.includes('year')) {
      period = 'yearly';
    } else {
      period = 'sale';
    }

    return {
      amount: isNaN(amount) ? 0 : amount,
      currency: 'SAR',
      period
    };
  }

  protected extractArea(areaText: string): { area: number; unit: 'sqm' | 'sqft' } {
    const cleanArea = areaText.replace(/[^\\d.,]/g, '');
    const area = parseFloat(cleanArea.replace(/,/g, ''));
    
    const unit = areaText.includes('sqft') || areaText.includes('قدم') ? 'sqft' : 'sqm';
    
    return {
      area: isNaN(area) ? 0 : area,
      unit
    };
  }

  protected extractRooms(text: string): { bedrooms?: number; bathrooms?: number } {
    const bedroomMatch = text.match(/(\\d+)\\s*(غرف|غرفة|bedroom|bed)/i);
    const bathroomMatch = text.match(/(\\d+)\\s*(حمام|bathroom|bath)/i);
    
    return {
      bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : undefined,
      bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : undefined
    };
  }

  abstract scrapeProperties(): Promise<ScrapingResult>;
  abstract scrapePropertyDetails(url: string): Promise<ScrapedProperty | null>;
}