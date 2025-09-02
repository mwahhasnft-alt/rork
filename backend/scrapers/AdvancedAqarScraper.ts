import { AdvancedBaseScraper } from './AdvancedBaseScraper';
import { ScrapedProperty, ScrapingResult } from '@/types/scraper';
import { Page } from 'puppeteer';

export class AdvancedAqarScraper extends AdvancedBaseScraper {
  constructor() {
    super('aqar', {
      maxPages: 15,
      delayBetweenRequests: 5000,
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
      source: 'aqar',
      scrapedAt: new Date(),
      totalFound: 0
    };

    try {
      console.log('Starting advanced Aqar.fm scraping...');
      
      const baseUrls = [
        'https://sa.aqar.fm/search?city=الرياض&type=للبيع',
        'https://sa.aqar.fm/search?city=الرياض&type=للإيجار',
        'https://sa.aqar.fm/apartments-for-sale/riyadh',
        'https://sa.aqar.fm/villas-for-sale/riyadh'
      ];

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Scraping from: ${baseUrl}`);
          await this.scrapeFromUrl(baseUrl, result);
          
          // Random delay between different URLs
          await this.randomDelay(6000, 10000);
        } catch (error) {
          console.error(`Error scraping ${baseUrl}:`, error);
          result.errors.push(`URL scraping failed: ${baseUrl} - ${error}`);
        }
      }

      result.success = result.properties.length > 0;
      result.totalFound = result.properties.length;
      
      console.log(`Aqar scraping completed: ${result.properties.length} properties found`);
      
    } catch (error) {
      console.error('Aqar scraping failed:', error);
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
      await this.randomDelay(4000, 6000);

      // Aqar.fm-specific selectors
      const propertySelectors = [
        '.property-item',
        '.listing-item',
        '.ad-item',
        '[class*=\"property\"]',
        '[class*=\"listing\"]',
        '[class*=\"ad-card\"]'
      ];

      let propertyElements = null;
      
      for (const selector of propertySelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
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
        propertyElements = await page.$$('a[href*=\"/property/\"], a[href*=\"/ad/\"], a[href*=\"/listing/\"]');
        console.log(`Fallback: Found ${propertyElements.length} potential property links`);
      }

      // Extract property data
      for (let i = 0; i < Math.min(propertyElements.length, 40); i++) {
        try {
          const property = await this.extractPropertyFromElement(page, i, url);
          if (property) {
            result.properties.push(property);
          }
          
          // Small delay between extractions
          await this.randomDelay(800, 1500);
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
          '.property-item',
          '.listing-item',
          '.ad-item',
          '[class*=\"property\"]',
          '[class*=\"listing\"]',
          '[class*=\"ad-card\"]'
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
          const links = document.querySelectorAll('a[href*=\"/property/\"], a[href*=\"/ad/\"], a[href*=\"/listing/\"]');
          if (links[idx]) {
            element = links[idx].closest('div, article, section') || links[idx];
          }
        }

        if (!element) return null;

        // Extract title (Arabic and English)
        const titleSelectors = ['h2', 'h3', '.title', '.ad-title', '[class*=\"title\"]', '.property-title'];
        let title = '';
        for (const sel of titleSelectors) {
          const titleEl = element.querySelector(sel);
          if (titleEl && titleEl.textContent?.trim()) {
            title = titleEl.textContent.trim();
            break;
          }
        }

        // Extract price (handle Arabic numerals)
        const priceSelectors = ['.price', '.ad-price', '[class*=\"price\"]', '.property-price'];
        let priceText = '';
        for (const sel of priceSelectors) {
          const priceEl = element.querySelector(sel);
          if (priceEl && priceEl.textContent?.trim()) {
            priceText = priceEl.textContent.trim();
            break;
          }
        }

        // Extract location (Arabic text)
        const locationSelectors = ['.location', '.ad-location', '[class*=\"location\"]', '.property-location'];
        let locationText = '';
        for (const sel of locationSelectors) {
          const locationEl = element.querySelector(sel);
          if (locationEl && locationEl.textContent?.trim()) {
            locationText = locationEl.textContent.trim();
            break;
          }
        }

        // Extract area/size
        const areaSelectors = ['.area', '.ad-area', '[class*=\"area\"]', '[class*=\"size\"]', '.property-area'];
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
        const linkEl = element.querySelector('a[href*=\"/property/\"], a[href*=\"/ad/\"], a[href*=\"/listing/\"]');
        if (linkEl) {
          propertyUrl = linkEl.getAttribute('href') || '';
        }

        // Extract images
        const images: string[] = [];
        const imgElements = element.querySelectorAll('img');
        imgElements.forEach((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy');
          if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('avatar')) {
            images.push(src);
          }
        });

        // Extract full text for analysis
        const fullText = element.textContent || '';
        
        return {
          title,
          priceText,
          locationText,
          areaText,
          propertyUrl,
          images,
          fullText
        };
      }, index);

      if (!propertyData || !propertyData.title) {
        return null;
      }

      // Process the extracted data
      const price = this.extractPrice(propertyData.priceText);
      const location = this.parseArabicLocation(propertyData.locationText);
      const size = propertyData.areaText ? this.extractArea(propertyData.areaText) : undefined;
      const rooms = this.extractRooms(propertyData.fullText);

      // Determine property type from Arabic text
      const propertyType = this.determineArabicPropertyType(propertyData.title + ' ' + propertyData.fullText);

      const property: ScrapedProperty = {
        title: this.cleanText(propertyData.title),
        location,
        price,
        propertyType,
        size,
        rooms,
        description: this.cleanText(propertyData.title),
        images: propertyData.images.map(img => 
          img.startsWith('http') ? img : `https://sa.aqar.fm${img}`
        ),
        listingUrl: propertyData.propertyUrl.startsWith('http') 
          ? propertyData.propertyUrl 
          : `https://sa.aqar.fm${propertyData.propertyUrl}`,
        source: 'aqar',
        scrapedAt: new Date(),
        features: this.extractArabicFeatures(propertyData.fullText)
      };

      return property;
    } catch (error) {
      console.error('Error extracting property data:', error);
      return null;
    }
  }

  private parseArabicLocation(locationText: string): { city: string; district: string; region: string } {
    const parts = locationText.split(',').map(part => part.trim());
    
    // Arabic city name mapping
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

    const arabicCity = parts[parts.length - 1] || 'الرياض';
    const englishCity = cityMap[arabicCity] || arabicCity;

    return {
      city: englishCity,
      district: parts[0] || 'Unknown',
      region: 'Saudi Arabia'
    };
  }

  private determineArabicPropertyType(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Arabic property type mapping
    if (lowerText.includes('فيلا') || lowerText.includes('villa')) return 'villa';
    if (lowerText.includes('مكتب') || lowerText.includes('office')) return 'office';
    if (lowerText.includes('أرض') || lowerText.includes('land')) return 'land';
    if (lowerText.includes('محل') || lowerText.includes('تجاري') || lowerText.includes('commercial')) return 'commercial';
    if (lowerText.includes('بيت') || lowerText.includes('house')) return 'villa';
    if (lowerText.includes('مستودع') || lowerText.includes('warehouse')) return 'commercial';
    
    return 'apartment'; // Default for شقة
  }

  private extractArabicFeatures(text: string): string[] {
    const features: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Arabic feature mapping
    if (lowerText.includes('موقف') || lowerText.includes('parking')) features.push('Parking');
    if (lowerText.includes('مسبح') || lowerText.includes('pool')) features.push('Swimming Pool');
    if (lowerText.includes('حديقة') || lowerText.includes('garden')) features.push('Garden');
    if (lowerText.includes('جيم') || lowerText.includes('gym')) features.push('Gym');
    if (lowerText.includes('أمن') || lowerText.includes('security')) features.push('Security');
    if (lowerText.includes('مصعد') || lowerText.includes('elevator')) features.push('Elevator');
    if (lowerText.includes('شرفة') || lowerText.includes('balcony')) features.push('Balcony');
    if (lowerText.includes('مفروش') || lowerText.includes('furnished')) features.push('Furnished');
    if (lowerText.includes('تكييف') || lowerText.includes('ac')) features.push('Air Conditioning');
    if (lowerText.includes('خادمة') || lowerText.includes('maid')) features.push('Maid Room');
    if (lowerText.includes('سائق') || lowerText.includes('driver')) features.push('Driver Room');
    
    return features;
  }

  async scrapePropertyDetails(url: string): Promise<ScrapedProperty | null> {
    const page = await this.createPage();
    
    try {
      const success = await this.navigateWithRetry(page, url);
      if (!success) {
        return null;
      }

      // Wait for detailed content to load
      await this.randomDelay(3000, 5000);

      // Extract detailed property information from Arabic site
      const detailedData = await page.evaluate(() => {
        return {
          description: document.querySelector('.description, .property-description, .ad-description')?.textContent || '',
          features: Array.from(document.querySelectorAll('.feature, .amenity, .property-feature')).map(el => el.textContent?.trim() || ''),
          contact: {
            agent: document.querySelector('.agent-name, .contact-name')?.textContent?.trim() || '',
            phone: document.querySelector('.agent-phone, .contact-phone')?.textContent?.trim() || '',
            email: document.querySelector('.agent-email, .contact-email')?.textContent?.trim() || ''
          }
        };
      });

      // Return enhanced property data
      console.log('Detailed data extracted:', detailedData);
      return null; // Placeholder for now
      
    } catch (error) {
      console.error('Error scraping property details:', error);
      return null;
    } finally {
      await page.close();
    }
  }
}