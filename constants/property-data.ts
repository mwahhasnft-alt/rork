import { Property } from '@/types/property';

// Comprehensive Saudi Arabian property listings
export const SAUDI_PROPERTIES: Property[] = [
  // Riyadh Properties
  {
    id: 'RYD001',
    title: 'شقة فاخرة في برج المملكة',
    description: 'شقة مفروشة بالكامل مع إطلالة رائعة على مدينة الرياض، تحتوي على جميع وسائل الراحة الحديثة وقريبة من المراكز التجارية والمدارس.',
    price: 2500000,
    currency: 'SAR',
    location: {
      city: 'الرياض',
      district: 'العليا',
      coordinates: {
        latitude: 24.6877,
        longitude: 46.7219
      }
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      floor: 15,
      totalFloors: 30,
      parking: true,
      furnished: true,
      yearBuilt: 2020
    },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'
    ],
    type: 'apartment',
    status: 'available',
    features: ['مكيف مركزي', 'مصعد', 'أمن 24 ساعة', 'موقف سيارات', 'حديقة', 'صالة رياضية'],
    agent: {
      id: 'AGT001',
      name: 'أحمد العبدالله',
      phone: '+966501234567',
      email: 'ahmed@aqarai.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'RYD002',
    title: 'فيلا عصرية في حي الملقا',
    description: 'فيلا حديثة التصميم مع حديقة واسعة ومسبح خاص، تقع في حي راقي وهادئ مع سهولة الوصول لجميع الخدمات.',
    price: 4200000,
    currency: 'SAR',
    location: {
      city: 'الرياض',
      district: 'الملقا',
      coordinates: {
        latitude: 24.7736,
        longitude: 46.6111
      }
    },
    details: {
      bedrooms: 5,
      bathrooms: 4,
      area: 450,
      parking: true,
      furnished: false,
      yearBuilt: 2022
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    type: 'villa',
    status: 'available',
    features: ['مسبح خاص', 'حديقة كبيرة', 'مجلس رجال', 'مجلس نساء', 'غرفة خادمة', 'مطبخ مجهز'],
    agent: {
      id: 'AGT002',
      name: 'فاطمة الزهراني',
      phone: '+966502345678',
      email: 'fatima@aqarai.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'RYD003',
    title: 'شقة اقتصادية في حي النسيم',
    description: 'شقة مناسبة للعائلات الصغيرة، في موقع متميز قريب من المدارس والمستشفيات والمراكز التجارية.',
    price: 850000,
    currency: 'SAR',
    location: {
      city: 'الرياض',
      district: 'النسيم',
      coordinates: {
        latitude: 24.6204,
        longitude: 46.7113
      }
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      area: 120,
      floor: 3,
      totalFloors: 5,
      parking: true,
      furnished: false,
      yearBuilt: 2018
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    type: 'apartment',
    status: 'available',
    features: ['مكيف شباك', 'مصعد', 'موقف سيارات'],
    agent: {
      id: 'AGT003',
      name: 'محمد الشمري',
      phone: '+966503456789',
      email: 'mohammed@aqarai.com'
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16')
  },
  
  // Jeddah Properties
  {
    id: 'JED001',
    title: 'شقة بإطلالة بحرية في الكورنيش',
    description: 'شقة فاخرة مطلة على البحر الأحمر مباشرة، مع تشطيبات عالية الجودة وموقع استراتيجي في قلب جدة.',
    price: 1800000,
    currency: 'SAR',
    location: {
      city: 'جدة',
      district: 'الكورنيش',
      coordinates: {
        latitude: 21.4858,
        longitude: 39.1925
      }
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      area: 160,
      floor: 8,
      totalFloors: 12,
      parking: true,
      furnished: true,
      yearBuilt: 2021
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800'
    ],
    type: 'apartment',
    status: 'available',
    features: ['إطلالة بحرية', 'مكيف مركزي', 'مصعد', 'أمن 24 ساعة', 'حمام سباحة مشترك'],
    agent: {
      id: 'AGT004',
      name: 'سارة القحطاني',
      phone: '+966504567890',
      email: 'sara@aqarai.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'JED002',
    title: 'فيلا تراثية في البلد',
    description: 'فيلا تراثية مرممة بعناية في قلب جدة التاريخية، تجمع بين الأصالة والحداثة.',
    price: 3500000,
    currency: 'SAR',
    location: {
      city: 'جدة',
      district: 'البلد',
      coordinates: {
        latitude: 21.4858,
        longitude: 39.1925
      }
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      parking: true,
      furnished: false,
      yearBuilt: 1950
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ],
    type: 'villa',
    status: 'available',
    features: ['تصميم تراثي', 'فناء داخلي', 'روشان خشبية', 'موقع تاريخي'],
    agent: {
      id: 'AGT005',
      name: 'عبدالرحمن الغامدي',
      phone: '+966505678901',
      email: 'abdulrahman@aqarai.com'
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19')
  },
  
  // Dammam Properties
  {
    id: 'DAM001',
    title: 'مكتب تجاري في حي الفيصلية',
    description: 'مكتب تجاري في موقع استراتيجي مناسب للشركات والمؤسسات، مع مواقف سيارات واسعة.',
    price: 1200000,
    currency: 'SAR',
    location: {
      city: 'الدمام',
      district: 'الفيصلية',
      coordinates: {
        latitude: 26.4282,
        longitude: 50.1020
      }
    },
    details: {
      bedrooms: 0,
      bathrooms: 2,
      area: 200,
      floor: 2,
      totalFloors: 8,
      parking: true,
      furnished: false,
      yearBuilt: 2019
    },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    type: 'office',
    status: 'available',
    features: ['مكيف مركزي', 'مصعد', 'موقف سيارات', 'أمن', 'استقبال'],
    agent: {
      id: 'AGT006',
      name: 'خالد العتيبي',
      phone: '+966506789012',
      email: 'khalid@aqarai.com'
    },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'DAM002',
    title: 'أرض سكنية في حي الشاطئ',
    description: 'أرض سكنية في موقع ممتاز قريب من الشاطئ، مناسبة لبناء فيلا أو مجمع سكني.',
    price: 950000,
    currency: 'SAR',
    location: {
      city: 'الدمام',
      district: 'الشاطئ',
      coordinates: {
        latitude: 26.4207,
        longitude: 50.0888
      }
    },
    details: {
      area: 600,
      parking: false,
      furnished: false
    },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    ],
    type: 'land',
    status: 'available',
    features: ['قريب من الشاطئ', 'منطقة هادئة', 'خدمات متوفرة'],
    agent: {
      id: 'AGT007',
      name: 'نورا الدوسري',
      phone: '+966507890123',
      email: 'nora@aqarai.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    },
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-17')
  },
  
  // Mecca Properties
  {
    id: 'MEC001',
    title: 'شقة قريبة من الحرم المكي',
    description: 'شقة مفروشة بالكامل على بعد دقائق من الحرم المكي الشريف، مثالية للحج والعمرة.',
    price: 2800000,
    currency: 'SAR',
    location: {
      city: 'مكة المكرمة',
      district: 'العزيزية',
      coordinates: {
        latitude: 21.3891,
        longitude: 39.8579
      }
    },
    details: {
      bedrooms: 2,
      bathrooms: 2,
      area: 100,
      floor: 5,
      totalFloors: 15,
      parking: false,
      furnished: true,
      yearBuilt: 2023
    },
    images: [
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    type: 'apartment',
    status: 'available',
    features: ['قريب من الحرم', 'مفروش بالكامل', 'مكيف مركزي', 'مصعد'],
    agent: {
      id: 'AGT008',
      name: 'عبدالله الحربي',
      phone: '+966508901234',
      email: 'abdullah@aqarai.com'
    },
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-23')
  },
  
  // Medina Properties
  {
    id: 'MED001',
    title: 'فيلا في المدينة المنورة',
    description: 'فيلا واسعة في المدينة المنورة، قريبة من المسجد النبوي الشريف، مناسبة للعائلات الكبيرة.',
    price: 3200000,
    currency: 'SAR',
    location: {
      city: 'المدينة المنورة',
      district: 'قباء',
      coordinates: {
        latitude: 24.4539,
        longitude: 39.5940
      }
    },
    details: {
      bedrooms: 6,
      bathrooms: 4,
      area: 400,
      parking: true,
      furnished: false,
      yearBuilt: 2020
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    ],
    type: 'villa',
    status: 'available',
    features: ['قريب من المسجد النبوي', 'حديقة واسعة', 'مجلس كبير', 'مطبخ مجهز'],
    agent: {
      id: 'AGT009',
      name: 'أميرة الأنصاري',
      phone: '+966509012345',
      email: 'amira@aqarai.com',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150'
    },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-20')
  }
];

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