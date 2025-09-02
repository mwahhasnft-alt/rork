import { AdvancedBaseScraper } from './AdvancedBaseScraper';
import { ScrapedProperty, ScrapingResult } from '@/types/scraper';
import { Page } from 'puppeteer';

export class AdvancedBayutScraper extends AdvancedBaseScraper {
  constructor() {
    super('bayut', {
      maxPages: 15,
      delayBetweenRequests: 4000,
      headless: true,
      useProxy: false, // Set to true when you have proxies
      solveCaptcha: true,
      blockResources: ['image', 'stylesheet', 'font'] // Keep media for property images
    });
  }

  async scrapeProperties(): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      properties: [],
      errors: [],
      source: 'bayut',
      scrapedAt: new Date(),
      totalFound: 0
    };

    try {
      console.log('Starting advanced Bayut scraping...');
      
      const baseUrls = [
        'https://www.bayut.sa/to-buy/property/riyadh/',
        'https://www.bayut.sa/to-rent/property/riyadh/',
        'https://www.bayut.sa/to-buy/apartments/riyadh/',
        'https://www.bayut.sa/to-buy/villas/riyadh/'
      ];

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Scraping from: ${baseUrl}`);
          await this.scrapeFromUrl(baseUrl, result);
          
          // Random delay between different URLs
          await this.randomDelay(5000, 8000);
        } catch (error) {
          console.error(`Error scraping ${baseUrl}:`, error);
          result.errors.push(`URL scraping failed: ${baseUrl} - ${error}`);
        }
      }

      result.success = result.properties.length > 0;
      result.totalFound = result.properties.length;
      
      console.log(`Bayut scraping completed: ${result.properties.length} properties found`);
      
    } catch (error) {
      console.error('Bayut scraping failed:', error);
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
      await this.randomDelay(3000, 5000);

      // Bayut-specific selectors (these may need updating based on current site structure)
      const propertySelectors = [
        '[data-testid=\"property-card\"]',
        '.property-card',
        '.listing-card',
        '[class*=\"PropertyCard\"]',
        '[class*=\"ListingCard\"]'
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
        propertyElements = await page.$$('a[href*=\"/property/\"], a[href*=\"/listing/\"]');
        console.log(`Fallback: Found ${propertyElements.length} potential property links`);
      }

      // Extract property data
      for (let i = 0; i < Math.min(propertyElements.length, 50); i++) {
        try {
          const property = await this.extractPropertyFromElement(page, i, url);
          if (property) {
            result.properties.push(property);
          }
          
          // Small delay between extractions
          await this.randomDelay(500, 1000);
        } catch (error) {
          console.error(`Error extracting property ${i}:`, error);
          result.errors.push(`Property extraction error: ${error}`);
        }
      }

      // Try to navigate to next page
      await this.tryNextPage(page, result, url);

    } catch (error) {
      console.error(`Error scraping page ${url}:`, error);
      result.errors.push(`Page scraping error: ${error}`);
    } finally {
      await page.close();
    }
  }

  private async extractPropertyFromElement(page: Page, index: number, baseUrl: string): Promise<ScrapedProperty | null> {
    try {
      // Use page.evaluate to extract data from the specific element
      const propertyData = await page.evaluate((idx) => {
        const selectors = [
          '[data-testid=\"property-card\"]',
          '.property-card',
          '.listing-card',
          '[class*=\"PropertyCard\"]',
          '[class*=\"ListingCard\"]'
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
          // Fallback to any property link
          const links = document.querySelectorAll('a[href*=\"/property/\"], a[href*=\"/listing/\"]');
          if (links[idx]) {
            element = links[idx].closest('div, article, section') || links[idx];
          }
        }

        if (!element) return null;

        // Extract title
        const titleSelectors = ['h2', 'h3', '[data-testid*=\"title\"]', '.title', '[class*=\"title\"]'];
        let title = '';
        for (const sel of titleSelectors) {
          const titleEl = element.querySelector(sel);
          if (titleEl && titleEl.textContent?.trim()) {
            title = titleEl.textContent.trim();
            break;
          }
        }

        // Extract price
        const priceSelectors = ['[data-testid*=\"price\"]', '.price', '[class*=\"price\"]', '[class*=\"Price\"]'];
        let priceText = '';
        for (const sel of priceSelectors) {
          const priceEl = element.querySelector(sel);
          if (priceEl && priceEl.textContent?.trim()) {
            priceText = priceEl.textContent.trim();
            break;
          }
        }

        // Extract location
        const locationSelectors = ['[data-testid*=\"location\"]', '.location', '[class*=\"location\"]', '[class*=\"Location\"]'];
        let locationText = '';
        for (const sel of locationSelectors) {
          const locationEl = element.querySelector(sel);
          if (locationEl && locationEl.textContent?.trim()) {
            locationText = locationEl.textContent.trim();
            break;
          }
        }

        // Extract area/size
        const areaSelectors = ['[data-testid*=\"area\"]', '.area', '[class*=\"area\"]', '[class*=\"size\"]'];
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
        const linkEl = element.querySelector('a[href*=\"/property/\"], a[href*=\"/listing/\"]');
        if (linkEl) {
          propertyUrl = linkEl.getAttribute('href') || '';
        }

        // Extract images
        const images: string[] = [];
        const imgElements = element.querySelectorAll('img');
        imgElements.forEach((img) => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !src.includes('placeholder') && !src.includes('logo')) {
            images.push(src);
          }
        });

        // Extract room info from text content
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
      const location = this.parseLocation(propertyData.locationText);
      const size = propertyData.areaText ? this.extractArea(propertyData.areaText) : undefined;
      const rooms = this.extractRooms(propertyData.fullText);

      // Determine property type from title and text
      const propertyType = this.determinePropertyType(propertyData.title + ' ' + propertyData.fullText);

      const property: ScrapedProperty = {
        title: this.cleanText(propertyData.title),
        location,
        price,
        propertyType,
        size,
        rooms,
        description: this.cleanText(propertyData.title),
        images: propertyData.images.map(img => 
          img.startsWith('http') ? img : `https://www.bayut.sa${img}`
        ),
        listingUrl: propertyData.propertyUrl.startsWith('http') 
          ? propertyData.propertyUrl 
          : `https://www.bayut.sa${propertyData.propertyUrl}`,
        source: 'bayut',
        scrapedAt: new Date(),
        features: this.extractFeatures(propertyData.fullText)
      };

      return property;
    } catch (error) {
      console.error('Error extracting property data:', error);
      return null;
    }
  }

  private parseLocation(locationText: string): { city: string; district: string; region: string } {
    const parts = locationText.split(',').map(part => part.trim());
    return {
      city: parts[parts.length - 1] || 'Riyadh',
      district: parts[0] || 'Unknown',
      region: 'Riyadh Region'
    };
  }

  private determinePropertyType(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('villa') || lowerText.includes('فيلا')) return 'villa';
    if (lowerText.includes('office') || lowerText.includes('مكتب')) return 'office';
    if (lowerText.includes('land') || lowerText.includes('أرض')) return 'land';
    if (lowerText.includes('commercial') || lowerText.includes('تجاري')) return 'commercial';
    return 'apartment';
  }

  private extractFeatures(text: string): string[] {
    const features: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('parking') || lowerText.includes('موقف')) features.push('Parking');
    if (lowerText.includes('pool') || lowerText.includes('مسبح')) features.push('Swimming Pool');
    if (lowerText.includes('garden') || lowerText.includes('حديقة')) features.push('Garden');
    if (lowerText.includes('gym') || lowerText.includes('جيم')) features.push('Gym');
    if (lowerText.includes('security') || lowerText.includes('أمن')) features.push('Security');
    if (lowerText.includes('elevator') || lowerText.includes('مصعد')) features.push('Elevator');
    if (lowerText.includes('balcony') || lowerText.includes('شرفة')) features.push('Balcony');
    
    return features;
  }

  private async tryNextPage(page: Page, result: ScrapingResult, currentUrl: string): Promise<void> {
    try {
      // Look for next page button
      const nextButtonSelectors = [
        '[data-testid=\"pagination-next\"]',
        '.pagination-next',
        'a[aria-label=\"Next\"]',
        '.next-page',
        '[class*=\"next\"]'
      ];

      for (const selector of nextButtonSelectors) {
        const nextButton = await page.$(selector);
        if (nextButton) {
          const isDisabled = await page.evaluate((btn) => {
            return btn.hasAttribute('disabled') || btn.classList.contains('disabled');
          }, nextButton);

          if (!isDisabled) {
            console.log('Found next page button, navigating...');
            await nextButton.click();
            await this.randomDelay(3000, 5000);
            
            // Recursively scrape the next page (limit to prevent infinite loops)
            const currentPageMatch = currentUrl.match(/page=(\d+)/);
            const currentPage = currentPageMatch ? parseInt(currentPageMatch[1]) : 1;
            
            if (currentPage < this.config.maxPages) {
              await this.scrapeFromUrl(currentUrl, result);
            }
          }
          break;
        }
      }
    } catch (error) {
      console.log('No next page found or error navigating:', error);
    }
  }

  async scrapePropertyDetails(url: string): Promise<ScrapedProperty | null> {
    const page = await this.createPage();
    
    try {
      const success = await this.navigateWithRetry(page, url);
      if (!success) {
        return null;
      }

      // Wait for detailed content to load
      await this.randomDelay(2000, 4000);

      // Extract detailed property information
      const detailedData = await page.evaluate(() => {
        // This would extract more detailed information from the property detail page
        // Implementation depends on Bayut's current page structure
        return {
          description: document.querySelector('.description, .property-description')?.textContent || '',
          features: Array.from(document.querySelectorAll('.feature, .amenity')).map(el => el.textContent?.trim() || ''),
          contact: {
            agent: document.querySelector('.agent-name')?.textContent?.trim() || '',
            phone: document.querySelector('.agent-phone')?.textContent?.trim() || '',
            email: document.querySelector('.agent-email')?.textContent?.trim() || ''
          }
        };
      });

      // Return enhanced property data
      // This is a simplified version - you'd combine this with the basic property data
      return null; // Placeholder for now
      
    } catch (error) {
      console.error('Error scraping property details:', error);
      return null;
    } finally {
      await page.close();
    }
  }
}