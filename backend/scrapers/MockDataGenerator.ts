import { ScrapedProperty, ScrapingResult, ScrapingStats } from '@/types/scraper';

export class MockDataGenerator {
  private static instance: MockDataGenerator;
  private properties: ScrapedProperty[] = [];
  private lastGenerated: Date | null = null;

  private constructor() {
    try {
      console.log('MockDataGenerator constructor called');
      this.generateInitialData();
      console.log('MockDataGenerator initialized with', this.properties.length, 'properties');
    } catch (error) {
      console.error('Error initializing MockDataGenerator:', error);
      // Ensure we have at least empty arrays
      this.properties = [];
      this.lastGenerated = new Date();
      console.log('MockDataGenerator fallback initialization complete');
    }
  }

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  private generateInitialData(): void {
    console.log('Generating initial mock property data...');
    
    const bayutProperties = this.generatePropertiesForSource('bayut', 25);
    const aqarProperties = this.generatePropertiesForSource('aqar', 30);
    const wasaltProperties = this.generatePropertiesForSource('wasalt', 20);
    const sremProperties = this.generatePropertiesForSource('srem', 35);
    
    this.properties = [...bayutProperties, ...aqarProperties, ...wasaltProperties, ...sremProperties];
    this.lastGenerated = new Date();
    
    console.log(`Generated ${this.properties.length} mock properties`);
  }

  private generatePropertiesForSource(source: 'bayut' | 'aqar' | 'wasalt' | 'srem', count: number): ScrapedProperty[] {
    const properties: ScrapedProperty[] = [];
    
    const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Taif', 'Abha'];
    const riyadhDistricts = ['Al Nakheel', 'Al Malqa', 'Al Olaya', 'King Fahd', 'Al Yasmin', 'Al Sahafa', 'KAFD', 'Al Tahlia', 'Al Muraba', 'Al Rawda'];
    const jeddahDistricts = ['Al Hamra', 'Al Zahra', 'Al Rawdah', 'Al Salamah', 'Al Sharafiyah', 'Al Corniche', 'Al Balad', 'Al Faisaliyah'];
    const dammamDistricts = ['Al Ferdous', 'Al Shati', 'Al Noor', 'Al Qadisiyah', 'Al Adamah', 'Al Jalawiyah'];
    
    const propertyTypes = ['apartment', 'villa', 'office', 'commercial', 'land'];
    const features = [
      ['Parking', 'Security', 'Elevator', 'AC'],
      ['Garden', 'Swimming Pool', 'Gym', 'Playground'],
      ['Balcony', 'Storage', 'Maid Room', 'Driver Room'],
      ['Furnished', 'Internet', 'Satellite TV', 'Kitchen Appliances'],
      ['Reception Area', 'Conference Room', 'Central AC', 'High Speed Internet'],
      ['Street Facing', 'High Traffic', 'Display Windows', 'Storage Room']
    ];

    const images = [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
    ];

    for (let i = 0; i < count; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      let districts = riyadhDistricts;
      if (city === 'Jeddah') districts = jeddahDistricts;
      else if (city === 'Dammam') districts = dammamDistricts;
      
      const district = districts[Math.floor(Math.random() * districts.length)];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const featureSet = features[Math.floor(Math.random() * features.length)];
      
      // Generate realistic prices based on city and type
      let basePrice = 500000;
      if (city === 'Riyadh') basePrice = 800000;
      else if (city === 'Jeddah') basePrice = 700000;
      else if (city === 'Dammam') basePrice = 600000;
      
      if (propertyType === 'villa') basePrice *= 2.5;
      else if (propertyType === 'office') basePrice *= 1.8;
      else if (propertyType === 'commercial') basePrice *= 2.2;
      else if (propertyType === 'land') basePrice *= 1.5;
      
      const price = Math.round(basePrice + (Math.random() * basePrice * 0.8));
      
      // Generate realistic areas
      let area = 100;
      if (propertyType === 'villa') area = 300 + Math.random() * 400;
      else if (propertyType === 'apartment') area = 80 + Math.random() * 200;
      else if (propertyType === 'office') area = 150 + Math.random() * 350;
      else if (propertyType === 'commercial') area = 100 + Math.random() * 500;
      else if (propertyType === 'land') area = 400 + Math.random() * 1000;
      
      const bedrooms = propertyType === 'villa' ? 3 + Math.floor(Math.random() * 4) :
                      propertyType === 'apartment' ? 1 + Math.floor(Math.random() * 4) : 0;
      
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.7));
      
      // Generate property titles
      const titlePrefixes = {
        apartment: ['Modern Apartment', 'Luxury Apartment', 'Spacious Apartment', 'Family Apartment', 'Executive Apartment'],
        villa: ['Luxury Villa', 'Family Villa', 'Modern Villa', 'Spacious Villa', 'Executive Villa'],
        office: ['Office Space', 'Executive Office', 'Modern Office', 'Premium Office', 'Business Center'],
        commercial: ['Retail Space', 'Commercial Property', 'Shop', 'Showroom', 'Warehouse'],
        land: ['Residential Land', 'Commercial Land', 'Investment Land', 'Development Land', 'Prime Land']
      };
      
      const titlePrefix = titlePrefixes[propertyType as keyof typeof titlePrefixes][Math.floor(Math.random() * 5)];
      const title = `${titlePrefix} in ${district}`;
      
      // Generate descriptions
      const descriptions = {
        apartment: `Beautiful ${bedrooms}-bedroom apartment with modern amenities and great location in ${district}. Perfect for families or professionals.`,
        villa: `Stunning ${bedrooms}-bedroom villa with private garden and premium finishes. Located in the prestigious ${district} area.`,
        office: `Professional office space in prime location. Ideal for businesses looking for modern facilities in ${district}.`,
        commercial: `Prime commercial property with excellent visibility and foot traffic. Perfect investment opportunity in ${district}.`,
        land: `Excellent land opportunity for development or investment. Located in the growing ${district} area with great potential.`
      };
      
      const property: ScrapedProperty = {
        title,
        location: {
          city,
          district,
          region: `${city} Region`
        },
        price: {
          amount: price,
          currency: 'SAR',
          period: propertyType === 'land' ? 'sale' : (Math.random() > 0.7 ? 'monthly' : 'sale')
        },
        propertyType,
        size: {
          area: Math.round(area),
          unit: 'sqm' as const
        },
        rooms: {
          bedrooms,
          bathrooms
        },
        description: descriptions[propertyType as keyof typeof descriptions],
        images: this.shuffleArray([...images]).slice(0, 2 + Math.floor(Math.random() * 3)),
        listingUrl: `https://${source}.com/property-${Date.now()}-${i}`,
        source,
        scrapedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        features: [...featureSet],
        contact: {
          agent: this.generateAgentName(),
          phone: this.generatePhoneNumber(),
          email: `agent${i}@${source}.com`
        }
      };
      
      properties.push(property);
    }
    
    return properties;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateAgentName(): string {
    const firstNames = ['Ahmed', 'Mohammed', 'Abdullah', 'Omar', 'Khalid', 'Fahad', 'Saud', 'Faisal', 'Sara', 'Noura', 'Maha', 'Reem'];
    const lastNames = ['Al-Rashid', 'Al-Mahmoud', 'Al-Fahad', 'Al-Saud', 'Al-Qahtani', 'Al-Otaibi', 'Al-Harbi', 'Al-Ghamdi'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  private generatePhoneNumber(): string {
    const prefixes = ['050', '053', '054', '055', '056', '058', '059'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `+966 ${prefix} ${number.toString().slice(0, 3)} ${number.toString().slice(3)}`;
  }

  // Public methods for the scraping system
  async scrapeAllSources(): Promise<ScrapingStats> {
    console.log('Mock scraping all sources...');
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Occasionally refresh data to simulate new properties
    if (!this.lastGenerated || Date.now() - this.lastGenerated.getTime() > 24 * 60 * 60 * 1000) {
      this.generateInitialData();
    }
    
    const stats: ScrapingStats = {
      totalProperties: this.properties.length,
      newProperties: Math.floor(Math.random() * 10) + 5, // Random new properties
      updatedProperties: Math.floor(Math.random() * 5),
      errors: Math.floor(Math.random() * 3), // Occasional errors for realism
      lastRun: new Date(),
      sources: {
        bayut: this.properties.filter(p => p.source === 'bayut').length,
        aqar: this.properties.filter(p => p.source === 'aqar').length,
        wasalt: this.properties.filter(p => p.source === 'wasalt').length
      }
    };
    
    return stats;
  }

  async scrapeSpecificSource(source: 'bayut' | 'aqar' | 'wasalt'): Promise<ScrapingResult> {
    console.log(`Mock scraping ${source}...`);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
    
    const sourceProperties = this.properties.filter(p => p.source === source);
    
    // Occasionally add new properties
    if (Math.random() > 0.7) {
      const newProperties = this.generatePropertiesForSource(source, Math.floor(Math.random() * 3) + 1);
      this.properties.push(...newProperties);
      sourceProperties.push(...newProperties);
    }
    
    return {
      success: true,
      properties: sourceProperties,
      errors: Math.random() > 0.8 ? ['Minor connection timeout'] : [], // Occasional errors
      source,
      scrapedAt: new Date(),
      totalFound: sourceProperties.length
    };
  }

  getScrapedProperties(): ScrapedProperty[] {
    return [...(this.properties || [])];
  }

  getPropertiesBySource(source: string): ScrapedProperty[] {
    return (this.properties || []).filter(p => p.source === source);
  }

  clearCache(): void {
    this.properties = [];
    this.lastGenerated = null;
  }

  // SREM specific methods
  async scrapeSremData(): Promise<{ success: boolean; properties: ScrapedProperty[]; message: string }> {
    console.log('Mock scraping SREM data...');
    
    // Simulate longer delay for government data
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const sremProperties = this.properties.filter(p => p.source === 'srem');
    
    // Occasionally refresh SREM data
    if (Math.random() > 0.6) {
      const newSremProperties = this.generatePropertiesForSource('srem', Math.floor(Math.random() * 5) + 2);
      // Remove old SREM properties and add new ones
      this.properties = this.properties.filter(p => p.source !== 'srem');
      this.properties.push(...newSremProperties);
      
      return {
        success: true,
        properties: newSremProperties,
        message: `Successfully collected ${newSremProperties.length} properties from SREM`
      };
    }
    
    return {
      success: true,
      properties: sremProperties,
      message: `Retrieved ${sremProperties.length} cached properties from SREM`
    };
  }

  // Analytics methods
  generateAnalytics() {
    const properties = this.properties || [];
    
    if (properties.length === 0) {
      return {
        totalProperties: 0,
        cityDistribution: {},
        typeDistribution: {},
        priceRanges: {},
        averagePrice: 0,
        averageArea: 0,
        sourceDistribution: {},
        lastUpdated: new Date()
      };
    }

    const cityDistribution = properties.reduce((acc, prop) => {
      const city = prop.location.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeDistribution = properties.reduce((acc, prop) => {
      const type = prop.propertyType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceDistribution = properties.reduce((acc, prop) => {
      const source = prop.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priceRanges = {
      'Under 500K': properties.filter(p => p.price.amount < 500000).length,
      '500K - 1M': properties.filter(p => p.price.amount >= 500000 && p.price.amount < 1000000).length,
      '1M - 2M': properties.filter(p => p.price.amount >= 1000000 && p.price.amount < 2000000).length,
      'Over 2M': properties.filter(p => p.price.amount >= 2000000).length
    };

    const totalPrice = properties.reduce((sum, prop) => sum + prop.price.amount, 0);
    const totalArea = properties.reduce((sum, prop) => sum + (prop.size?.area || 0), 0);
    const averagePrice = Math.round(totalPrice / properties.length);
    const averageArea = Math.round(totalArea / properties.length);

    return {
      totalProperties: properties.length,
      cityDistribution,
      typeDistribution,
      sourceDistribution,
      priceRanges,
      averagePrice,
      averageArea,
      lastUpdated: new Date()
    };
  }
}