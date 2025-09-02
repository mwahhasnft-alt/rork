import { Property, PropertyType } from '@/types/property';

// Generate comprehensive mock data for 100 properties
const generateMockProperties = (): Property[] => {
  const cities = [
    { name: 'الرياض', districts: ['العليا', 'الملقا', 'النسيم', 'الملز', 'الورود', 'الياسمين', 'النرجس', 'الربوة', 'المروج', 'الصحافة'] },
    { name: 'جدة', districts: ['الكورنيش', 'البلد', 'الروضة', 'الزهراء', 'الشاطئ', 'الحمراء', 'الصفا', 'المرجان', 'الفيصلية', 'الأندلس'] },
    { name: 'الدمام', districts: ['الفيصلية', 'الشاطئ', 'الجلوية', 'الأمانة', 'الضباب', 'الفردوس', 'الواحة', 'الخليج', 'المنار', 'الصناعية'] },
    { name: 'مكة المكرمة', districts: ['العزيزية', 'الشوقية', 'المسفلة', 'الكعكية', 'الحجون', 'جرول', 'الطندباوي', 'الغزة', 'الرصيفة', 'الشبيكة'] },
    { name: 'المدينة المنورة', districts: ['قباء', 'العوالي', 'الحرة الشرقية', 'الحرة الغربية', 'المطار', 'الجامعة', 'الأزهري', 'الدفاع', 'الخالدية', 'السيح'] },
    { name: 'الخبر', districts: ['الكورنيش', 'العقربية', 'الثقبة', 'الجسر', 'الراكة', 'الخزامى', 'الولايات', 'الحزم', 'الأندلس', 'الفيصلية'] },
    { name: 'الطائف', districts: ['الحوية', 'الشفا', 'الهدا', 'الفيصلية', 'الوشحاء', 'الروضة', 'السلامة', 'المثناة', 'الخالدية', 'الصفا'] },
    { name: 'المدينة الصناعية', districts: ['الجبيل', 'ينبع', 'رأس تنورة', 'الأحساء', 'حفر الباطن', 'عرعر', 'سكاكا', 'تبوك', 'حائل', 'أبها'] }
  ];

  const propertyTypes: PropertyType[] = ['apartment', 'villa', 'office', 'land', 'commercial'];
  const statuses = ['available', 'sold', 'rented', 'pending'] as const;
  
  const agents = [
    { id: 'AGT001', name: 'أحمد العبدالله', phone: '+966501234567', email: 'ahmed@aqarai.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 'AGT002', name: 'فاطمة الزهراني', phone: '+966502345678', email: 'fatima@aqarai.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
    { id: 'AGT003', name: 'محمد الشمري', phone: '+966503456789', email: 'mohammed@aqarai.com' },
    { id: 'AGT004', name: 'سارة القحطاني', phone: '+966504567890', email: 'sara@aqarai.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 'AGT005', name: 'عبدالرحمن الغامدي', phone: '+966505678901', email: 'abdulrahman@aqarai.com' },
    { id: 'AGT006', name: 'خالد العتيبي', phone: '+966506789012', email: 'khalid@aqarai.com' },
    { id: 'AGT007', name: 'نورا الدوسري', phone: '+966507890123', email: 'nora@aqarai.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 'AGT008', name: 'عبدالله الحربي', phone: '+966508901234', email: 'abdullah@aqarai.com' },
    { id: 'AGT009', name: 'أميرة الأنصاري', phone: '+966509012345', email: 'amira@aqarai.com', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150' },
    { id: 'AGT010', name: 'يوسف الدوسري', phone: '+966510123456', email: 'youssef@aqarai.com' },
    { id: 'AGT011', name: 'هند الشهري', phone: '+966511234567', email: 'hind@aqarai.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'AGT012', name: 'عمر الجهني', phone: '+966512345678', email: 'omar@aqarai.com' }
  ];

  const apartmentImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
    'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800'
  ];

  const villaImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'
  ];

  const officeImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'
  ];

  const landImages = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800'
  ];

  const commercialImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800'
  ];

  const features = {
    apartment: ['مكيف مركزي', 'مصعد', 'أمن 24 ساعة', 'موقف سيارات', 'حديقة', 'صالة رياضية', 'حمام سباحة مشترك', 'بلكونة', 'مطبخ مجهز', 'إنترنت مجاني'],
    villa: ['مسبح خاص', 'حديقة كبيرة', 'مجلس رجال', 'مجلس نساء', 'غرفة خادمة', 'مطبخ مجهز', 'موقف سيارات متعدد', 'شرفة', 'غرفة غسيل', 'مدخل منفصل'],
    office: ['مكيف مركزي', 'مصعد', 'موقف سيارات', 'أمن', 'استقبال', 'قاعة اجتماعات', 'إنترنت عالي السرعة', 'مطبخ صغير', 'حمامات متعددة', 'إطلالة مميزة'],
    land: ['قريب من الشاطئ', 'منطقة هادئة', 'خدمات متوفرة', 'طريق معبد', 'كهرباء متوفرة', 'مياه متوفرة', 'صرف صحي', 'موقع استراتيجي', 'قريب من المدارس', 'قريب من المستشفيات'],
    commercial: ['موقع تجاري ممتاز', 'واجهة زجاجية', 'مساحة عرض كبيرة', 'مخزن', 'موقف عملاء', 'أمن', 'تكييف مركزي', 'إضاءة ممتازة', 'مدخل منفصل', 'قريب من المراكز التجارية']
  };

  const propertyTitles = {
    apartment: [
      'شقة فاخرة مع إطلالة رائعة',
      'شقة عصرية مفروشة بالكامل',
      'شقة اقتصادية للعائلات',
      'شقة واسعة في موقع مميز',
      'شقة حديثة التشطيب',
      'شقة بإطلالة بحرية',
      'شقة في برج سكني راقي',
      'شقة مع بلكونة واسعة',
      'شقة قريبة من الخدمات',
      'شقة للاستثمار'
    ],
    villa: [
      'فيلا عصرية مع مسبح خاص',
      'فيلا تراثية مرممة',
      'فيلا واسعة للعائلات الكبيرة',
      'فيلا حديثة التصميم',
      'فيلا مع حديقة كبيرة',
      'فيلا في حي راقي',
      'فيلا دوبلكس مميزة',
      'فيلا مع مجالس منفصلة',
      'فيلا للبيع أو الإيجار',
      'فيلا استثمارية'
    ],
    office: [
      'مكتب تجاري في موقع استراتيجي',
      'مكتب إداري مجهز بالكامل',
      'مكتب واسع للشركات',
      'مكتب في برج تجاري',
      'مكتب مع قاعة اجتماعات',
      'مكتب بإطلالة مميزة',
      'مكتب للإيجار الشهري',
      'مكتب حديث التجهيز',
      'مكتب في المنطقة التجارية',
      'مكتب استثماري'
    ],
    land: [
      'أرض سكنية في موقع ممتاز',
      'أرض تجارية على شارع رئيسي',
      'أرض زراعية خصبة',
      'أرض للاستثمار العقاري',
      'أرض قريبة من البحر',
      'أرض في منطقة تطوير',
      'أرض مخططة للبناء',
      'أرض واسعة للمشاريع',
      'أرض بإطلالة جبلية',
      'أرض استثمارية مميزة'
    ],
    commercial: [
      'محل تجاري في موقع حيوي',
      'مجمع تجاري للاستثمار',
      'معرض تجاري واسع',
      'مطعم جاهز للتشغيل',
      'صالة عرض مميزة',
      'مكتب تجاري مع مخزن',
      'محل على شارع تجاري',
      'مساحة تجارية متعددة الاستخدامات',
      'مبنى تجاري كامل',
      'استثمار تجاري مضمون'
    ]
  };

  const properties: Property[] = [];

  for (let i = 0; i < 100; i++) {
    const cityData = cities[Math.floor(Math.random() * cities.length)];
    const district = cityData.districts[Math.floor(Math.random() * cityData.districts.length)];
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    
    let images: string[];
    switch (type) {
      case 'apartment':
        images = apartmentImages.slice(0, Math.floor(Math.random() * 3) + 2);
        break;
      case 'villa':
        images = villaImages.slice(0, Math.floor(Math.random() * 3) + 2);
        break;
      case 'office':
        images = officeImages.slice(0, Math.floor(Math.random() * 2) + 2);
        break;
      case 'land':
        images = landImages.slice(0, Math.floor(Math.random() * 2) + 1);
        break;
      case 'commercial':
        images = commercialImages.slice(0, Math.floor(Math.random() * 3) + 2);
        break;
      default:
        images = apartmentImages.slice(0, 2);
    }

    const titleOptions = propertyTitles[type as keyof typeof propertyTitles];
    const title = `${titleOptions[Math.floor(Math.random() * titleOptions.length)]} في ${district}`;
    
    const basePrice = type === 'apartment' ? 800000 + Math.random() * 2000000 :
                     type === 'villa' ? 2000000 + Math.random() * 4000000 :
                     type === 'office' ? 500000 + Math.random() * 2000000 :
                     type === 'land' ? 300000 + Math.random() * 2000000 :
                     1000000 + Math.random() * 3000000;
    
    const price = Math.round(basePrice / 50000) * 50000;
    
    const bedrooms = type === 'apartment' ? Math.floor(Math.random() * 4) + 1 :
                    type === 'villa' ? Math.floor(Math.random() * 6) + 3 :
                    type === 'office' || type === 'commercial' ? 0 :
                    undefined;
    
    const bathrooms = type === 'apartment' ? Math.floor(Math.random() * 3) + 1 :
                     type === 'villa' ? Math.floor(Math.random() * 4) + 2 :
                     type === 'office' || type === 'commercial' ? Math.floor(Math.random() * 3) + 1 :
                     undefined;
    
    const area = type === 'apartment' ? 80 + Math.random() * 200 :
                type === 'villa' ? 250 + Math.random() * 400 :
                type === 'office' ? 100 + Math.random() * 300 :
                type === 'land' ? 400 + Math.random() * 1000 :
                150 + Math.random() * 500;
    
    const yearBuilt = 2010 + Math.floor(Math.random() * 14);
    const furnished = Math.random() > 0.6;
    const parking = Math.random() > 0.2;
    
    const propertyFeatures = features[type as keyof typeof features];
    const selectedFeatures = propertyFeatures
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 6) + 3);
    
    const descriptions = [
      `عقار مميز في ${district} يتميز بموقع استراتيجي وتشطيبات عالية الجودة. يوفر جميع وسائل الراحة والرفاهية للعائلات العصرية.`,
      `فرصة استثمارية ممتازة في ${district}، العقار في حالة ممتازة ويقع في منطقة حيوية قريبة من جميع الخدمات والمرافق.`,
      `عقار حديث البناء في ${district} مع تصميم عصري وإطلالة رائعة. مناسب للسكن أو الاستثمار العقاري.`,
      `موقع مثالي في ${district} يجمع بين الهدوء والقرب من المراكز التجارية والتعليمية والصحية.`,
      `عقار فاخر في ${district} يوفر أعلى مستويات الراحة والخصوصية مع تشطيبات راقية ومرافق متكاملة.`
    ];
    
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const createdDate = new Date(2024, 0, Math.floor(Math.random() * 30) + 1);
    const updatedDate = new Date(createdDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000);
    
    properties.push({
      id: `PROP${String(i + 1).padStart(3, '0')}`,
      title,
      description,
      price,
      currency: 'SAR',
      location: {
        city: cityData.name,
        district,
        coordinates: {
          latitude: 24.7136 + (Math.random() - 0.5) * 10,
          longitude: 46.6753 + (Math.random() - 0.5) * 10
        }
      },
      details: {
        bedrooms,
        bathrooms,
        area: Math.round(area),
        floor: type !== 'land' && type !== 'villa' ? Math.floor(Math.random() * 20) + 1 : undefined,
        totalFloors: type !== 'land' && type !== 'villa' ? Math.floor(Math.random() * 10) + 10 : undefined,
        parking,
        furnished,
        yearBuilt
      },
      images,
      type,
      status,
      features: selectedFeatures,
      agent,
      createdAt: createdDate,
      updatedAt: updatedDate
    });
  }
  
  return properties;
};

// Comprehensive Saudi Arabian property listings (100 properties)
export const SAUDI_PROPERTIES: Property[] = generateMockProperties();

// Property search and filter utilities
export const searchProperties = (properties: Property[], query: string): Property[] => {
  if (!query.trim()) return properties;
  
  const searchTerm = query.toLowerCase().trim();
  
  return properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm) ||
    property.description.toLowerCase().includes(searchTerm) ||
    property.location.city.toLowerCase().includes(searchTerm) ||
    property.location.district.toLowerCase().includes(searchTerm) ||
    property.type.toLowerCase().includes(searchTerm) ||
    property.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
};

export const filterPropertiesByPrice = (properties: Property[], minPrice: number, maxPrice: number): Property[] => {
  return properties.filter(property => 
    property.price >= minPrice && property.price <= maxPrice
  );
};

export const filterPropertiesByType = (properties: Property[], types: string[]): Property[] => {
  if (types.length === 0) return properties;
  return properties.filter(property => types.includes(property.type));
};

export const filterPropertiesByCity = (properties: Property[], cities: string[]): Property[] => {
  if (cities.length === 0) return properties;
  return properties.filter(property => cities.includes(property.location.city));
};

export const sortProperties = (properties: Property[], sortBy: 'price' | 'area' | 'date', order: 'asc' | 'desc' = 'desc'): Property[] => {
  return [...properties].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'area':
        comparison = a.details.area - b.details.area;
        break;
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

// Get property statistics
export const getPropertyStats = (properties: Property[]) => {
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  
  const priceStats = {
    min: Math.min(...properties.map(p => p.price)),
    max: Math.max(...properties.map(p => p.price)),
    average: properties.reduce((sum, p) => sum + p.price, 0) / totalProperties
  };
  
  const typeDistribution = properties.reduce((acc, property) => {
    acc[property.type] = (acc[property.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const cityDistribution = properties.reduce((acc, property) => {
    acc[property.location.city] = (acc[property.location.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalProperties,
    availableProperties,
    priceStats,
    typeDistribution,
    cityDistribution
  };
};

// AI Assistant property search function
export const searchPropertiesForAI = (query: string): Property[] => {
  const lowerQuery = query.toLowerCase();
  let results = SAUDI_PROPERTIES;
  
  // Extract search criteria from natural language
  if (lowerQuery.includes('شقة') || lowerQuery.includes('apartment')) {
    results = results.filter(p => p.type === 'apartment');
  }
  if (lowerQuery.includes('فيلا') || lowerQuery.includes('villa')) {
    results = results.filter(p => p.type === 'villa');
  }
  if (lowerQuery.includes('مكتب') || lowerQuery.includes('office')) {
    results = results.filter(p => p.type === 'office');
  }
  if (lowerQuery.includes('أرض') || lowerQuery.includes('land')) {
    results = results.filter(p => p.type === 'land');
  }
  
  // Filter by city
  if (lowerQuery.includes('رياض') || lowerQuery.includes('riyadh')) {
    results = results.filter(p => p.location.city === 'الرياض');
  }
  if (lowerQuery.includes('جدة') || lowerQuery.includes('jeddah')) {
    results = results.filter(p => p.location.city === 'جدة');
  }
  if (lowerQuery.includes('دمام') || lowerQuery.includes('dammam')) {
    results = results.filter(p => p.location.city === 'الدمام');
  }
  if (lowerQuery.includes('مكة') || lowerQuery.includes('mecca')) {
    results = results.filter(p => p.location.city === 'مكة المكرمة');
  }
  if (lowerQuery.includes('مدينة') || lowerQuery.includes('medina')) {
    results = results.filter(p => p.location.city === 'المدينة المنورة');
  }
  
  // Filter by price range
  if (lowerQuery.includes('رخيص') || lowerQuery.includes('اقتصادي') || lowerQuery.includes('cheap')) {
    results = results.filter(p => p.price < 1500000);
  }
  if (lowerQuery.includes('فاخر') || lowerQuery.includes('غالي') || lowerQuery.includes('luxury')) {
    results = results.filter(p => p.price > 2000000);
  }
  
  // Filter by features
  if (lowerQuery.includes('مسبح') || lowerQuery.includes('pool')) {
    results = results.filter(p => p.features.some(f => f.includes('مسبح')));
  }
  if (lowerQuery.includes('حديقة') || lowerQuery.includes('garden')) {
    results = results.filter(p => p.features.some(f => f.includes('حديقة')));
  }
  if (lowerQuery.includes('مفروش') || lowerQuery.includes('furnished')) {
    results = results.filter(p => p.details.furnished);
  }
  
  // Sort by relevance (newest first)
  return sortProperties(results, 'date', 'desc').slice(0, 10);
};