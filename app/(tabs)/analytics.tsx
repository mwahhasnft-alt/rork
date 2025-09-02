import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TrendingUp, TrendingDown, BarChart3, PieChart, MapPin, Home, RefreshCw, Database } from 'lucide-react-native';
import { useProperties } from '@/contexts/PropertyContext';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomHeader } from '@/components/ui/CustomHeader';

type TrendDir = 'up' | 'down';

interface SremAnalyticsShape {
  totalProperties: number;
  averagePrice: number;
  averageArea: number;
  marketTrends: { priceGrowth: number; demandIndicators: string[] };
  regionalData: {
    riyadh: { count: number; avgPrice: number; avgArea: number };
    jeddah: { count: number; avgPrice: number; avgArea: number };
    dammam: { count: number; avgPrice: number; avgArea: number };
    other: { count: number; avgPrice: number; avgArea: number };
  };
}

export default function AnalyticsScreen() {
  const { getStats } = useProperties();
  const { colors } = useTheme();
  const stats = getStats();
  const [sremData, setSremData] = useState<SremAnalyticsShape | null>(null);
  const [isLoadingSrem, setIsLoadingSrem] = useState<boolean>(false);
  const [lastSremUpdate, setLastSremUpdate] = useState<Date | null>(null);

  // SREM data queries
  const sremAnalyticsQuery = trpc.srem.getAnalytics.useQuery(undefined, { staleTime: 60_000 });
  const sremStatusQuery = trpc.srem.getStatus.useQuery(undefined, { refetchInterval: 5_000 });
  const scrapeSremMutation = trpc.srem.scrapeData.useMutation();

  // Scraping (Bayut/Aqar/Wasalt)
  const scrapingStatusQuery = trpc.scraping.getStatus.useQuery(undefined, { refetchInterval: 5_000 });
  const dataInfoQuery = trpc.scraping.getDataInfo.useQuery(undefined, { staleTime: 30_000 });
  const historyQuery = trpc.scraping.getHistory.useQuery({ limit: 10 });
  const startScrapingMutation = trpc.scraping.start.useMutation();

  useEffect(() => {
    if (sremAnalyticsQuery.data?.success) {
      setSremData(sremAnalyticsQuery.data.analytics as SremAnalyticsShape);
      setLastSremUpdate(sremAnalyticsQuery.data.lastScrape ? new Date(sremAnalyticsQuery.data.lastScrape) : null);
    }
  }, [sremAnalyticsQuery.data]);

  const handleSremDataCollection = useCallback(async () => {
    setIsLoadingSrem(true);
    try {
      const result = await scrapeSremMutation.mutateAsync();
      if (result.success) {
        Alert.alert('نجح', result.message);
        sremAnalyticsQuery.refetch();
        sremStatusQuery.refetch();
      } else {
        Alert.alert('خطأ', result.message);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في جمع البيانات من موقع سريم');
    } finally {
      setIsLoadingSrem(false);
    }
  }, [scrapeSremMutation, sremAnalyticsQuery, sremStatusQuery]);

  const [selectedSources, setSelectedSources] = useState<Array<'bayut' | 'aqar' | 'wasalt'>>(['bayut', 'aqar', 'wasalt']);

  const toggleSource = useCallback((src: 'bayut' | 'aqar' | 'wasalt') => {
    setSelectedSources(prev => prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]);
  }, []);

  const handleCollectSelected = useCallback(async () => {
    try {
      const sources = selectedSources.length > 0 ? [...selectedSources] : undefined;
      const res = await startScrapingMutation.mutateAsync({ sources });
      if (res.success) {
        Alert.alert('تم', res.message ?? 'تم بدء الجمع');
        scrapingStatusQuery.refetch();
        dataInfoQuery.refetch();
        historyQuery.refetch();
      } else {
        Alert.alert('خطأ', res.message ?? 'فشل بدء الجمع');
      }
    } catch (e) {
      Alert.alert('خطأ', 'تعذر بدء الجمع للمصادر المحددة');
    }
  }, [selectedSources, startScrapingMutation, scrapingStatusQuery, dataInfoQuery, historyQuery]);

  const StatCard = React.memo(({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: any;
    trend?: TrendDir;
    trendValue?: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]} testID={`stat-card-${title}`}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Icon color={colors.tint} size={24} />
        </View>
        {trend && (
          <View style={[styles.trendContainer, trend === 'up' ? styles.trendUp : styles.trendDown]}>
            {trend === 'up' ? (
              <TrendingUp color="#34C759" size={16} />
            ) : (
              <TrendingDown color="#FF3B30" size={16} />
            )}
            <Text style={[styles.trendText, trend === 'up' ? styles.trendUpText : styles.trendDownText]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: colors.placeholder }]}>{subtitle}</Text>}
    </View>
  ));

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون ريال`;
    }
    return `${(price / 1000).toFixed(0)} ألف ريال`;
  }, []);

  const formatSremPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}م ر.س`;
    }
    return `${(price / 1000).toFixed(0)}ك ر.س`;
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <CustomHeader 
        titleEn="Analytics"
        titleAr="تحليلات"
        showLogo={true}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* SREM Data Collection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>بيانات وزارة العدل - سريم</Text>
            <TouchableOpacity 
              testID="btn-srem-collect"
              style={[styles.collectButton, (isLoadingSrem || sremStatusQuery.data?.isScrapingInProgress) && styles.collectButtonDisabled]} 
              onPress={handleSremDataCollection}
              disabled={isLoadingSrem || sremStatusQuery.data?.isScrapingInProgress}
            >
              {isLoadingSrem || sremStatusQuery.data?.isScrapingInProgress ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Database color="#FFFFFF" size={16} />
              )}
              <Text style={styles.collectButtonText}>
                {isLoadingSrem || sremStatusQuery.data?.isScrapingInProgress ? 'جاري الجمع...' : 'جمع البيانات'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {lastSremUpdate && (
            <Text style={styles.lastUpdateText}>
              آخر تحديث: {lastSremUpdate.toLocaleDateString('ar-SA')} {lastSremUpdate.toLocaleTimeString('ar-SA')}
            </Text>
          )}
          
          {sremData && (
            <View style={[styles.sremStatsContainer, { backgroundColor: colors.card }]}>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{sremData.totalProperties}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>إجمالي العقارات</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{formatSremPrice(sremData.averagePrice)}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>متوسط السعر</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{sremData.averageArea} م²</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>متوسط المساحة</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>+{sremData.marketTrends.priceGrowth}%</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>نمو الأسعار</Text>
              </View>
            </View>
          )}
        </View>

        {/* Source Data Collection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>جمع البيانات من المصادر</Text>
            <TouchableOpacity
              testID="btn-collect-selected"
              style={[styles.collectButton, startScrapingMutation.isPending && styles.collectButtonDisabled]}
              onPress={handleCollectSelected}
              disabled={startScrapingMutation.isPending}
            >
              {startScrapingMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <RefreshCw color="#FFFFFF" size={16} />
              )}
              <Text style={styles.collectButtonText}>بدء الجمع</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sourcesRow}>
            {(['bayut','aqar','wasalt'] as const).map(src => {
              const active = selectedSources.includes(src);
              const isRunning = scrapingStatusQuery.data?.currentSources?.[src] ?? false;
              return (
                <TouchableOpacity
                  key={src}
                  testID={`toggle-${src}`}
                  style={[styles.sourcePill, { backgroundColor: active ? colors.tint : colors.backgroundSecondary }]}
                  onPress={() => toggleSource(src)}
                >
                  <Text style={[styles.sourcePillText, { color: active ? '#FFFFFF' : colors.text }]}>
                    {src.toUpperCase()} {isRunning ? '•' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {scrapingStatusQuery.data && (
            <View style={[styles.sremStatsContainer, { backgroundColor: colors.card }]}>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{scrapingStatusQuery.data.summary?.sources?.bayut ?? 0}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>Bayut</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{scrapingStatusQuery.data.summary?.sources?.aqar ?? 0}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>Aqar</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{scrapingStatusQuery.data.summary?.sources?.wasalt ?? 0}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>Wasalt</Text>
              </View>
              <View style={styles.sremStatItem}>
                <Text style={[styles.sremStatValue, { color: colors.tint }]}>{scrapingStatusQuery.data.summary?.totalProperties ?? 0}</Text>
                <Text style={[styles.sremStatLabel, { color: colors.placeholder }]}>الإجمالي</Text>
              </View>
            </View>
          )}
        </View>

        {/* SREM Regional Analysis */}
        {sremData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>التحليل الإقليمي - سريم</Text>
            <View style={[styles.regionalContainer, { backgroundColor: colors.card }]}>
              <View style={styles.regionalItem}>
                <View style={styles.regionalHeader}>
                  <MapPin color={colors.tint} size={16} />
                  <Text style={[styles.regionalCity, { color: colors.text }]}>الرياض</Text>
                </View>
                <Text style={[styles.regionalCount, { color: colors.placeholder }]}>{sremData.regionalData.riyadh.count} عقار</Text>
                <Text style={[styles.regionalPrice, { color: colors.tint }]}>{formatSremPrice(sremData.regionalData.riyadh.avgPrice)}</Text>
              </View>
              
              <View style={styles.regionalItem}>
                <View style={styles.regionalHeader}>
                  <MapPin color={colors.tint} size={16} />
                  <Text style={[styles.regionalCity, { color: colors.text }]}>جدة</Text>
                </View>
                <Text style={[styles.regionalCount, { color: colors.placeholder }]}>{sremData.regionalData.jeddah.count} عقار</Text>
                <Text style={[styles.regionalPrice, { color: colors.tint }]}>{formatSremPrice(sremData.regionalData.jeddah.avgPrice)}</Text>
              </View>
              
              <View style={styles.regionalItem}>
                <View style={styles.regionalHeader}>
                  <MapPin color={colors.tint} size={16} />
                  <Text style={[styles.regionalCity, { color: colors.text }]}>الدمام</Text>
                </View>
                <Text style={[styles.regionalCount, { color: colors.placeholder }]}>{sremData.regionalData.dammam.count} عقار</Text>
                <Text style={[styles.regionalPrice, { color: colors.tint }]}>{formatSremPrice(sremData.regionalData.dammam.avgPrice)}</Text>
              </View>
              
              <View style={styles.regionalItem}>
                <View style={styles.regionalHeader}>
                  <MapPin color={colors.tint} size={16} />
                  <Text style={[styles.regionalCity, { color: colors.text }]}>مدن أخرى</Text>
                </View>
                <Text style={[styles.regionalCount, { color: colors.placeholder }]}>{sremData.regionalData.other.count} عقار</Text>
                <Text style={[styles.regionalPrice, { color: colors.tint }]}>{formatSremPrice(sremData.regionalData.other.avgPrice)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Source Data Insights */}
        {dataInfoQuery.data && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>جودة البيانات والمصادر</Text>
            <View style={[styles.distributionContainer, { backgroundColor: colors.card }]}>
              <View style={styles.priceStatItem}>
                <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>إجمالي العقارات</Text>
                <Text style={[styles.priceStatValue, { color: colors.tint }]}>{dataInfoQuery.data.totalProperties ?? 0}</Text>
              </View>
              <View style={styles.priceStatItem}>
                <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>بيانات مكتملة</Text>
                <Text style={[styles.priceStatValue, { color: colors.tint }]}>{dataInfoQuery.data.dataQuality?.complete ?? 0}</Text>
              </View>
              <View style={styles.priceStatItem}>
                <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>بصور</Text>
                <Text style={[styles.priceStatValue, { color: colors.tint }]}>{dataInfoQuery.data.dataQuality?.withImages ?? 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Runs */}
        {historyQuery.data && historyQuery.data.history?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>آخر عمليات الجمع</Text>
            <View style={[styles.citiesContainer, { backgroundColor: colors.card }]}>
              {historyQuery.data.history.map((h: any) => (
                <View key={h.id} style={styles.cityItem}>
                  <View style={styles.cityHeader}>
                    <RefreshCw color={colors.tint} size={16} />
                    <Text style={[styles.cityName, { color: colors.text }]}>{new Date(h.startTime).toLocaleString('ar-SA')}</Text>
                  </View>
                  <View style={styles.cityStats}>
                    <Text style={[styles.cityCount, { color: colors.text }]}>{(h.totalProperties ?? h.stats?.totalProperties) ?? 0} عنصر</Text>
                    <Text style={[styles.cityPercentage, { color: colors.placeholder }]}>{Array.isArray(h.sources) ? h.sources.join(', ') : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SREM Market Trends */}
        {sremData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>مؤشرات السوق - سريم</Text>
            <View style={[styles.trendsContainer, { backgroundColor: colors.card }]}>
              {sremData.marketTrends.demandIndicators.map((indicator: string, index: number) => (
                <View key={index} style={styles.trendItem}>
                  <TrendingUp color="#34C759" size={20} />
                  <Text style={styles.trendDescription}>{indicator}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="إجمالي العقارات"
            value={stats.totalProperties.toString()}
            subtitle="عقار مسجل"
            icon={Home}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="العقارات المتاحة"
            value={stats.availableProperties.toString()}
            subtitle="جاهز للبيع"
            icon={BarChart3}
            trend="up"
            trendValue="+8%"
          />
        </View>

        {/* Price Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>إحصائيات الأسعار</Text>
          <View style={[styles.priceStatsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.priceStatItem}>
              <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>متوسط السعر</Text>
              <Text style={[styles.priceStatValue, { color: colors.tint }]}>
                {formatPrice(stats.priceStats.average)}
              </Text>
            </View>
            <View style={styles.priceStatItem}>
              <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>أعلى سعر</Text>
              <Text style={[styles.priceStatValue, { color: colors.tint }]}>
                {formatPrice(stats.priceStats.max)}
              </Text>
            </View>
            <View style={styles.priceStatItem}>
              <Text style={[styles.priceStatLabel, { color: colors.placeholder }]}>أقل سعر</Text>
              <Text style={[styles.priceStatValue, { color: colors.tint }]}>
                {formatPrice(stats.priceStats.min)}
              </Text>
            </View>
          </View>
        </View>

        {/* Property Types Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>توزيع أنواع العقارات</Text>
          <View style={[styles.distributionContainer, { backgroundColor: colors.card }]}>
            {Object.entries(stats.typeDistribution).map(([type, count]) => {
              const percentage = ((count / stats.totalProperties) * 100).toFixed(1);
              const typeNames: Record<string, string> = {
                apartment: 'شقق',
                villa: 'فلل',
                office: 'مكاتب',
                land: 'أراضي',
                commercial: 'تجاري'
              };
              
              return (
                <View key={type} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <Text style={[styles.distributionLabel, { color: colors.text }]}>{typeNames[type] || type}</Text>
                    <Text style={[styles.distributionPercentage, { color: colors.tint }]}>{percentage}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.tint }]} 
                    />
                  </View>
                  <Text style={[styles.distributionCount, { color: colors.placeholder }]}>{count} عقار</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Cities Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>توزيع العقارات حسب المدن</Text>
          <View style={[styles.citiesContainer, { backgroundColor: colors.card }]}>
            {Object.entries(stats.cityDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([city, count]) => {
                const percentage = ((count / stats.totalProperties) * 100).toFixed(1);
                
                return (
                  <View key={city} style={styles.cityItem}>
                    <View style={styles.cityHeader}>
                      <MapPin color={colors.tint} size={16} />
                      <Text style={[styles.cityName, { color: colors.text }]}>{city}</Text>
                    </View>
                    <View style={styles.cityStats}>
                      <Text style={[styles.cityCount, { color: colors.text }]}>{count} عقار</Text>
                      <Text style={[styles.cityPercentage, { color: colors.placeholder }]}>{percentage}%</Text>
                    </View>
                  </View>
                );
              })
            }
          </View>
        </View>

        {/* Market Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اتجاهات السوق</Text>
          <View style={styles.trendsContainer}>
            <View style={styles.trendItem}>
              <TrendingUp color="#34C759" size={20} />
              <View style={styles.trendContent}>
                <Text style={styles.trendTitle}>نمو في الطلب</Text>
                <Text style={styles.trendDescription}>
                  زيادة 15% في البحث عن الشقق في الرياض
                </Text>
              </View>
            </View>
            <View style={styles.trendItem}>
              <TrendingUp color="#34C759" size={20} />
              <View style={styles.trendContent}>
                <Text style={styles.trendTitle}>ارتفاع الأسعار</Text>
                <Text style={styles.trendDescription}>
                  متوسط أسعار الفلل ارتفع 8% هذا الشهر
                </Text>
              </View>
            </View>
            <View style={styles.trendItem}>
              <PieChart color="#007AFF" size={20} />
              <View style={styles.trendContent}>
                <Text style={styles.trendTitle}>المناطق الأكثر طلباً</Text>
                <Text style={styles.trendDescription}>
                  العليا والملقا في الرياض، الروضة في جدة
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendUp: {
    backgroundColor: '#E8F5E8',
  },
  trendDown: {
    backgroundColor: '#FFE8E8',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendUpText: {
    color: '#34C759',
  },
  trendDownText: {
    color: '#FF3B30',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
    marginBottom: 16,
  },
  priceStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  priceStatLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  priceStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  distributionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  distributionCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  citiesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  cityStats: {
    alignItems: 'flex-end',
  },
  cityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  cityPercentage: {
    fontSize: 12,
    color: '#8E8E93',
  },
  trendsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  trendContent: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collectButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginBottom: 12,
  },
  sremStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourcesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sourcePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFEFF4',
  },
  sourcePillActive: {
    backgroundColor: '#007AFF',
  },
  sourcePillText: {
    color: '#3A3A3C',
    fontSize: 14,
    fontWeight: '600',
  },
  sourcePillTextActive: {
    color: '#FFFFFF',
  },
  sremStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  sremStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  sremStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  regionalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  regionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  regionalCity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  regionalCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 16,
  },
  regionalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});