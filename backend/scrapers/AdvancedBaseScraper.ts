import { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import UserAgent from 'user-agents';
import { ScrapedProperty, ScrapingResult, ScrapingConfig } from '@/types/scraper';

// Configure puppeteer with stealth and recaptcha plugins
puppeteerExtra.use(StealthPlugin());
puppeteerExtra.use(RecaptchaPlugin({
  provider: {
    id: '2captcha',
    token: process.env.CAPTCHA_API_KEY || 'demo-key' // You'll need to set this
  },
  visualFeedback: true
}));

export interface AdvancedScrapingConfig extends ScrapingConfig {
  useProxy?: boolean;
  proxyList?: string[];
  rotateSessions?: boolean;
  solveCaptcha?: boolean;
  headless?: boolean;
  viewport?: { width: number; height: number };
  randomizeViewport?: boolean;
  blockResources?: string[];
  maxConcurrentPages?: number;
}

export abstract class AdvancedBaseScraper {
  protected config: AdvancedScrapingConfig;
  protected source: 'bayut' | 'aqar' | 'wasalt';
  protected browser: Browser | null = null;
  protected userAgents: string[];
  protected currentProxy: string | null = null;
  protected sessionCookies: Map<string, any[]> = new Map();

  constructor(source: 'bayut' | 'aqar' | 'wasalt', config?: Partial<AdvancedScrapingConfig>) {
    this.source = source;
    this.config = {
      maxPages: 10,
      delayBetweenRequests: 3000,
      userAgent: '',
      timeout: 60000,
      retryAttempts: 3,
      useProxy: true,
      proxyList: [
        // Add your residential proxy list here
        'http://username:password@proxy1.example.com:8080',
        'http://username:password@proxy2.example.com:8080',
        // For demo, we'll use no proxy
      ],
      rotateSessions: true,
      solveCaptcha: true,
      headless: true,
      viewport: { width: 1366, height: 768 },
      randomizeViewport: true,
      blockResources: ['image', 'stylesheet', 'font', 'media'],
      maxConcurrentPages: 3,
      ...config
    };

    // Generate pool of realistic user agents
    this.userAgents = this.generateUserAgents();
  }

  private generateUserAgents(): string[] {
    const agents = [];
    for (let i = 0; i < 20; i++) {
      const userAgent = new UserAgent({ deviceCategory: 'desktop' });
      agents.push(userAgent.toString());
    }
    return agents;
  }

  protected async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    console.log('Initializing advanced browser with anti-detection measures...');

    const launchOptions: any = {
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1366,768',
        '--user-agent=' + this.getRandomUserAgent()
      ]
    };

    // Add proxy if configured
    if (this.config.useProxy && this.config.proxyList && this.config.proxyList.length > 0) {
      this.currentProxy = this.getRandomProxy();
      if (this.currentProxy) {
        launchOptions.args.push(`--proxy-server=${this.currentProxy}`);
        console.log(`Using proxy: ${this.currentProxy}`);
      }
    }

    this.browser = await puppeteerExtra.launch(launchOptions);
    return this.browser;
  }

  protected async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Set random viewport
    if (this.config.randomizeViewport) {
      const viewport = this.getRandomViewport();
      await page.setViewport(viewport);
    } else {
      await page.setViewport(this.config.viewport!);
    }

    // Set random user agent
    await page.setUserAgent(this.getRandomUserAgent());

    // Block unnecessary resources to speed up scraping
    if (this.config.blockResources && this.config.blockResources.length > 0) {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (this.config.blockResources!.includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    // Set extra headers to mimic real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    });

    // Load session cookies if available
    const sessionKey = this.getSessionKey();
    if (this.sessionCookies.has(sessionKey)) {
      const cookies = this.sessionCookies.get(sessionKey)!;
      await page.setCookie(...cookies);
    }

    return page;
  }

  protected async navigateWithRetry(page: Page, url: string): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < this.config.retryAttempts) {
      try {
        console.log(`Navigating to ${url} (attempt ${attempts + 1})`);
        
        // Random delay before navigation
        await this.randomDelay(1000, 3000);
        
        const response = await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: this.config.timeout
        });

        if (response && response.status() === 200) {
          // Save cookies for session persistence
          const cookies = await page.cookies();
          const sessionKey = this.getSessionKey();
          this.sessionCookies.set(sessionKey, cookies);
          
          // Check for CAPTCHA and solve if needed
          if (this.config.solveCaptcha) {
            await this.handleCaptcha(page);
          }
          
          return true;
        }
      } catch (error) {
        console.error(`Navigation attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts < this.config.retryAttempts) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempts) + Math.random() * 1000, 30000);
          await this.delay(delay);
          
          // Rotate proxy on failure
          if (this.config.useProxy && attempts > 1) {
            await this.rotateProxy(page);
          }
        }
      }
    }
    
    return false;
  }

  protected async handleCaptcha(page: Page): Promise<void> {
    try {
      // Check for common CAPTCHA selectors
      const captchaSelectors = [
        '.g-recaptcha',
        '#recaptcha',
        '[data-sitekey]',
        '.captcha',
        '.hcaptcha'
      ];

      for (const selector of captchaSelectors) {
        const captchaElement = await page.$(selector);
        if (captchaElement) {
          console.log('CAPTCHA detected, attempting to solve...');
          
          // Use puppeteer-extra-plugin-recaptcha to solve
          try {
            await page.solveRecaptchas();
            console.log('CAPTCHA solved successfully');
            await this.randomDelay(2000, 4000);
          } catch (captchaError) {
            console.error('Failed to solve CAPTCHA:', captchaError);
            // Continue anyway, might not be blocking
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error handling CAPTCHA:', error);
    }
  }

  protected async rotateProxy(page: Page): Promise<void> {
    if (!this.config.useProxy || !this.config.proxyList || this.config.proxyList.length === 0) {
      return;
    }

    const newProxy = this.getRandomProxy();
    if (newProxy && newProxy !== this.currentProxy) {
      console.log(`Rotating proxy from ${this.currentProxy} to ${newProxy}`);
      this.currentProxy = newProxy;
      
      // Close current page and create new one with new proxy
      // Note: In a real implementation, you'd need to restart the browser with new proxy
      // For now, we'll just log the rotation
    }
  }

  protected getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  protected getRandomProxy(): string | null {
    if (!this.config.proxyList || this.config.proxyList.length === 0) {
      return null;
    }
    return this.config.proxyList[Math.floor(Math.random() * this.config.proxyList.length)];
  }

  protected getRandomViewport(): { width: number; height: number } {
    const viewports = [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  protected getSessionKey(): string {
    return `${this.source}-${this.currentProxy || 'no-proxy'}`;
  }

  protected async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.delay(delay);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ');
  }

  protected extractPrice(priceText: string): { amount: number; currency: string; period?: 'monthly' | 'yearly' | 'sale' } {
    const cleanPrice = priceText.replace(/[^\d.,]/g, '');
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
    const cleanArea = areaText.replace(/[^\d.,]/g, '');
    const area = parseFloat(cleanArea.replace(/,/g, ''));
    
    const unit = areaText.includes('sqft') || areaText.includes('قدم') ? 'sqft' : 'sqm';
    
    return {
      area: isNaN(area) ? 0 : area,
      unit
    };
  }

  protected extractRooms(text: string): { bedrooms?: number; bathrooms?: number } {
    const bedroomMatch = text.match(/(\d+)\s*(غرف|غرفة|bedroom|bed)/i);
    const bathroomMatch = text.match(/(\d+)\s*(حمام|bathroom|bath)/i);
    
    return {
      bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : undefined,
      bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : undefined
    };
  }

  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  abstract scrapeProperties(): Promise<ScrapingResult>;
  abstract scrapePropertyDetails(url: string): Promise<ScrapedProperty | null>;
}