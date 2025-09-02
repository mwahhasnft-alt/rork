import { AdvancedBaseScraper } from './AdvancedBaseScraper';
import { ScrapedProperty, ScrapingResult } from '@/types/scraper';
import { Page } from 'puppeteer';

export class AdvancedWasaltScraper extends AdvancedBaseScraper {
  constructor() {
    super('wasalt', {
      maxPages: 12,
      delayBetweenRequests: 6000,
      headless: true,
      useProxy: false, // Set to true when you have proxies
      solveCaptcha: true,
      blockResources: ['stylesheet', 'font'] // Keep images for properties
    });
  }

  async scrapeProperties(): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      properties: [],
      errors: [],
      source: 'wasalt',
      scrapedAt: new Date(),
      totalFound: 0
    };

    try {
      console.log('Starting advanced Wasalt scraping...');
      
      const baseUrls = [
        'https://wasalt.sa/properties/for-sale/riyadh',
        'https://wasalt.sa/properties/for-rent/riyadh',
        'https://wasalt.sa/villas/riyadh',
        'https://wasalt.sa/apartments/riyadh',
        'https://wasalt.sa/commercial/riyadh'
      ];

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Scraping from: ${baseUrl}`);
          await this.scrapeFromUrl(baseUrl, result);
          
          // Random delay between different URLs
          await this.randomDelay(7000, 12000);
        } catch (error) {
          console.error(`Error scraping ${baseUrl}:`, error);
          result.errors.push(`URL scraping failed: ${baseUrl} - ${error}`);
        }
      }

      result.success = result.properties.length > 0;
      result.totalFound = result.properties.length;
      
      console.log(`Wasalt scraping completed: ${result.properties.length} properties found`);
      
    } catch (error) {
      console.error('Wasalt scraping failed:', error);
      result.errors.push(`General scraping error: ${error}`);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  private async scrapeFromUrl(url: string, result: ScrapingResult): Promise<void> {
    const page = await this.createPage();
    
    try {
      const success = await this.navigateWithRetry(page, url);
      if (!success) {
        result.errors.push(`Failed to navigate to: ${url}`);
        return;
      }

      // Wait for content to load
      await this.randomDelay(5000, 8000);

      // Wasalt-specific selectors
      const propertySelectors = [
        '.property-card',
        '.listing-card',
        '.property-item',
        '[data-testid=\"property\"]',
        '[class*=\"property\"]',
        '[class*=\"listing\"]',
        '[class*=\"PropertyCard\"]'
      ];

      let propertyElements = null;
      
      for (const selector of propertySelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 15000 });
          propertyElements = await page.$$(selector);
          if (propertyElements.length > 0) {
            console.log(`Found ${propertyElements.length} properties using selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }

      if (!propertyElements || propertyElements.length === 0) {
        // Fallback: look for any links that might be properties
        propertyElements = await page.$$('a[href*=\"/property/\"], a[href*=\"/listing/\"], a[href*=\"/villa/\"], a[href*=\"/apartment/\"]');
        console.log(`Fallback: Found ${propertyElements.length} potential property links`);
      }

      // Extract property data
      for (let i = 0; i < Math.min(propertyElements.length, 35); i++) {
        try {
          const property = await this.extractPropertyFromElement(page, i, url);
          if (property) {
            result.properties.push(property);
          }
          
          // Small delay between extractions
          await this.randomDelay(1000, 2000);
        } catch (error) {
          console.error(`Error extracting property ${i}:`, error);
          result.errors.push(`Property extraction error: ${error}`);
        }
      }

    } catch (error) {
      console.error(`Error scraping page ${url}:`, error);
      result.errors.push(`Page scraping error: ${error}`);
    } finally {
      await page.close();
    }
  }

  private async extractPropertyFromElement(page: Page, index: number, baseUrl: string): Promise<ScrapedProperty | null> {
    try {
      const propertyData = await page.evaluate((idx) => {
        const selectors = [
          '.property-card',
          '.listing-card',
          '.property-item',
          '[data-testid=\"property\"]',
          '[class*=\"property\"]',
          '[class*=\"listing\"]',
          '[class*=\"PropertyCard\"]'
        ];

        let element = null;
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements[idx]) {
            element = elements[idx];
            break;
          }
        }

        if (!element) {
          const links = document.querySelectorAll('a[href*=\"/property/\"], a[href*=\"/listing/\"], a[href*=\"/villa/\"], a[href*=\"/apartment/\"]');
          if (links[idx]) {
            element = links[idx].closest('div, article, section') || links[idx];
          }
        }

        if (!element) return null;

        // Extract title
        const titleSelectors = ['h1', 'h2', 'h3', '.title', '.property-title', '[class*=\"title\"]', '[class*=\"Title\"]'];
        let title = '';
        for (const sel of titleSelectors) {
          const titleEl = element.querySelector(sel);
          if (titleEl && titleEl.textContent?.trim()) {
            title = titleEl.textContent.trim();
            break;
          }
        }

        // Extract price
        const priceSelectors = ['.price', '.property-price', '[class*=\"price\"]', '[class*=\"Price\"]', '[data-testid*=\"price\"]'];
        let priceText = '';
        for (const sel of priceSelectors) {
          const priceEl = element.querySelector(sel);
          if (priceEl && priceEl.textContent?.trim()) {
            priceText = priceEl.textContent.trim();
            break;
          }
        }

        // Extract location
        const locationSelectors = ['.location', '.property-location', '[class*=\"location\"]', '[class*=\"Location\"]', '.address'];
        let locationText = '';
        for (const sel of locationSelectors) {
          const locationEl = element.querySelector(sel);
          if (locationEl && locationEl.textContent?.trim()) {
            locationText = locationEl.textContent.trim();
            break;
          }
        }

        // Extract area/size
        const areaSelectors = ['.area', '.property-area', '[class*=\"area\"]', '[class*=\"size\"]', '[class*=\"Area\"]'];
        let areaText = '';
        for (const sel of areaSelectors) {
          const areaEl = element.querySelector(sel);
          if (areaEl && areaEl.textContent?.trim()) {
            areaText = areaEl.textContent.trim();
            break;
          }
        }

        // Extract property link
        let propertyUrl = '';
        const linkEl = element.querySelector('a');
        if (linkEl) {
          propertyUrl = linkEl.getAttribute('href') || '';
        }

        // Extract images
        const images: string[] = [];
        const imgElements = element.querySelectorAll('img');
        imgElements.forEach((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('avatar') && !src.includes('icon')) {
            images.push(src);
          }
        });

        // Extract description
        const descriptionSelectors = ['.description', '.property-description', '[class*=\"description\"]', '.summary'];
        let description = '';
        for (const sel of descriptionSelectors) {
          const descEl = element.querySelector(sel);
          if (descEl && descEl.textContent?.trim()) {
            description = descEl.textContent.trim();
            break;
          }
        }

        // Extract full text for analysis
        const fullText = element.textContent || '';
        
        return {
          title,
          priceText,
          locationText,
          areaText,
          propertyUrl,
          images,
          description,
          fullText
        };
      }, index);

      if (!propertyData || !propertyData.title) {
        return null;
      }

      // Process the extracted data
      const price = this.extractPrice(propertyData.priceText);
      const location = this.parseWasaltLocation(propertyData.locationText, baseUrl);
      const size = propertyData.areaText ? this.extractArea(propertyData.areaText) : undefined;
      const rooms = this.extractRooms(propertyData.fullText);

      // Determine property type from URL and text
      const propertyType = this.determineWasaltPropertyType(baseUrl, propertyData.title + ' ' + propertyData.fullText);

      const property: ScrapedProperty = {
        title: this.cleanText(propertyData.title),
        location,
        price,
        propertyType,
        size,
        rooms,
        description: this.cleanText(propertyData.description || propertyData.title),
        images: propertyData.images.map(img => 
          img.startsWith('http') ? img : `https://wasalt.sa${img}`
        ),
        listingUrl: propertyData.propertyUrl.startsWith('http') 
          ? propertyData.propertyUrl 
          : `https://wasalt.sa${propertyData.propertyUrl}`,
        source: 'wasalt',
        scrapedAt: new Date(),
        features: this.extractWasaltFeatures(propertyData.fullText),
        contact: this.extractContactInfo(propertyData.fullText)
      };

      return property;
    } catch (error) {
      console.error('Error extracting property data:', error);
      return null;
    }
  }

  private parseWasaltLocation(locationText: string, baseUrl: string): { city: string; district: string; region: string } {
    const parts = locationText.split(',').map(part => part.trim());
    
    // Extract city from URL if not clear from location text
    let city = 'Riyadh';
    if (baseUrl.includes('riyadh')) city = 'Riyadh';
    else if (baseUrl.includes('jeddah')) city = 'Jeddah';
    else if (baseUrl.includes('dammam')) city = 'Dammam';
    else if (baseUrl.includes('mecca')) city = 'Mecca';
    else if (baseUrl.includes('medina')) city = 'Medina';
    
    // Override with location text if available
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].toLowerCase();
      if (lastPart.includes('riyadh') || lastPart.includes('الرياض')) city = 'Riyadh';
      else if (lastPart.includes('jeddah') || lastPart.includes('جدة')) city = 'Jeddah';
      else if (lastPart.includes('dammam') || lastPart.includes('الدمام')) city = 'Dammam';
    }

    return {
      city,
      district: parts[0] || 'Unknown',
      region: 'Saudi Arabia'
    };
  }

  private determineWasaltPropertyType(url: string, text: string): string {
    const lowerUrl = url.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Check URL first
    if (lowerUrl.includes('villa')) return 'villa';
    if (lowerUrl.includes('apartment')) return 'apartment';
    if (lowerUrl.includes('commercial')) return 'commercial';
    if (lowerUrl.includes('office')) return 'office';
    if (lowerUrl.includes('land')) return 'land';
    
    // Check text content
    if (lowerText.includes('villa') || lowerText.includes('فيلا')) return 'villa';
    if (lowerText.includes('office') || lowerText.includes('مكتب')) return 'office';
    if (lowerText.includes('land') || lowerText.includes('أرض')) return 'land';
    if (lowerText.includes('commercial') || lowerText.includes('تجاري') || lowerText.includes('shop') || lowerText.includes('محل')) return 'commercial';
    if (lowerText.includes('warehouse') || lowerText.includes('مستودع')) return 'commercial';
    
    return 'apartment'; // Default
  }

  private extractWasaltFeatures(text: string): string[] {
    const features: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Premium features common in Wasalt listings
    if (lowerText.includes('parking') || lowerText.includes('موقف') || lowerText.includes('garage')) features.push('Parking');
    if (lowerText.includes('pool') || lowerText.includes('مسبح') || lowerText.includes('swimming')) features.push('Swimming Pool');
    if (lowerText.includes('garden') || lowerText.includes('حديقة') || lowerText.includes('landscap')) features.push('Garden');
    if (lowerText.includes('gym') || lowerText.includes('جيم') || lowerText.includes('fitness')) features.push('Gym');
    if (lowerText.includes('security') || lowerText.includes('أمن') || lowerText.includes('guard')) features.push('Security');
    if (lowerText.includes('elevator') || lowerText.includes('مصعد') || lowerText.includes('lift')) features.push('Elevator');
    if (lowerText.includes('balcony') || lowerText.includes('شرفة') || lowerText.includes('terrace')) features.push('Balcony');
    if (lowerText.includes('furnished') || lowerText.includes('مفروش')) features.push('Furnished');
    if (lowerText.includes('ac') || lowerText.includes('تكييف') || lowerText.includes('air condition')) features.push('Air Conditioning');
    if (lowerText.includes('maid') || lowerText.includes('خادمة') || lowerText.includes('servant')) features.push('Maid Room');
    if (lowerText.includes('driver') || lowerText.includes('سائق')) features.push('Driver Room');
    if (lowerText.includes('majlis') || lowerText.includes('مجلس')) features.push('Majlis');
    if (lowerText.includes('kitchen') || lowerText.includes('مطبخ')) features.push('Modern Kitchen');
    if (lowerText.includes('laundry') || lowerText.includes('غسيل')) features.push('Laundry Room');
    if (lowerText.includes('storage') || lowerText.includes('تخزين')) features.push('Storage');
    if (lowerText.includes('view') || lowerText.includes('إطلالة')) features.push('City View');
    
    return features;
  }

  private extractContactInfo(text: string): { agent: string; phone: string; email: string } | undefined {
    const phoneMatch = text.match(/(\+966|966|05)\s*\d{8,9}/);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    
    if (phoneMatch || emailMatch) {
      return {
        agent: 'Wasalt Agent',
        phone: phoneMatch ? phoneMatch[0] : '',
        email: emailMatch ? emailMatch[0] : ''
      };
    }
    
    return undefined;
  }

  async scrapePropertyDetails(url: string): Promise<ScrapedProperty | null> {
    const page = await this.createPage();
    
    try {
      const success = await this.navigateWithRetry(page, url);
      if (!success) {
        return null;
      }

      // Wait for detailed content to load
      await this.randomDelay(4000, 7000);

      // Extract detailed property information
      const detailedData = await page.evaluate(() => {
        return {
          description: document.querySelector('.description, .property-description, .details')?.textContent || '',
          features: Array.from(document.querySelectorAll('.feature, .amenity, .property-feature, .facility')).map(el => el.textContent?.trim() || ''),
          specifications: Array.from(document.querySelectorAll('.spec, .specification')).map(el => el.textContent?.trim() || ''),
          contact: {
            agent: document.querySelector('.agent-name, .contact-name, .broker-name')?.textContent?.trim() || '',
            phone: document.querySelector('.agent-phone, .contact-phone, .phone')?.textContent?.trim() || '',
            email: document.querySelector('.agent-email, .contact-email, .email')?.textContent?.trim() || ''
          },
          additionalImages: Array.from(document.querySelectorAll('.gallery img, .property-images img')).map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            return src && src.startsWith('http') ? src : src ? `https://wasalt.sa${src}` : '';
          }).filter(Boolean)
        };
      });

      // Return enhanced property data
      console.log('Detailed Wasalt data extracted:', detailedData);
      return null; // Placeholder for now
      
    } catch (error) {
      console.error('Error scraping Wasalt property details:', error);
      return null;
    } finally {
      await page.close();
    }
  }
}