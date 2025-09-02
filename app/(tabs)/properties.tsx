import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Search, MapPin, Bed, Bath, Square, Heart, Filter, RefreshCw } from 'lucide-react-native';
import { useProperties } from '@/contexts/PropertyContext';
import { Property } from '@/types/property';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, BorderRadius, Spacing, PropertyColors, StatusColors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { CustomHeader } from '@/components/ui/CustomHeader';

export default function PropertiesScreen() {
  const { colors, shadows } = useTheme();
  const {
    filteredProperties,
    searchQuery,
    favorites,
    isLoading,
    setSearchQuery,
    setFilters,
    toggleFavorite,
    selectProperty,
    refreshProperties,
    filters
  } = useProperties();
  
  const [selectedType, setSelectedType] = useState<'all' | 'apartment' | 'villa' | 'office' | 'land'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeFilter = (type: 'all' | 'apartment' | 'villa' | 'office' | 'land') => {
    setSelectedType(type);
    if (type === 'all') {
      setFilters({ type: undefined });
    } else {
      setFilters({ type: [type] });
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const isFavorite = favorites.includes(property.id);
    const statusColor = StatusColors[property.status as keyof typeof StatusColors] || colors.success;
    const typeColor = PropertyColors[property.type as keyof typeof PropertyColors] || colors.tint;
    
    return (
      <Card 
        variant="property" 
        padding="none" 
        style={[styles.propertyCard, shadows.medium]}
      >
        <TouchableOpacity 
          onPress={() => {
            selectProperty(property);
            router.push(`/property-details?id=${property.id}`);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: property.images[0] }} 
              style={styles.propertyImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={[styles.favoriteButton, shadows.small]}
              onPress={() => toggleFavorite(property.id)}
              activeOpacity={0.8}
            >
              <Heart 
                color={isFavorite ? colors.error : colors.card} 
                size={20} 
                fill={isFavorite ? colors.error : "transparent"}
              />
            </TouchableOpacity>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {property.status === 'available' ? 'متاح' : 'غير متاح'}
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeText}>
                {property.type === 'apartment' ? 'شقة' : 
                 property.type === 'villa' ? 'فيلا' :
                 property.type === 'office' ? 'مكتب' :
                 property.type === 'land' ? 'أرض' : 'تجاري'}
              </Text>
            </View>
          </View>
          
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: colors.text }]}>{property.title}</Text>
            <Text style={[styles.propertyPrice, { color: colors.tint }]}>
              {property.price.toLocaleString()} {property.currency}
            </Text>
            
            <View style={styles.locationContainer}>
              <MapPin color={colors.textTertiary} size={14} />
              <Text style={[styles.locationText, { color: colors.textTertiary }]}>
                {property.location.district}، {property.location.city}
              </Text>
            </View>

            <View style={styles.propertyDetails}>
              {property.details.bedrooms && property.details.bedrooms > 0 && (
                <View style={styles.detailItem}>
                  <Bed color={colors.textTertiary} size={16} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>{property.details.bedrooms}</Text>
                </View>
              )}
              {property.details.bathrooms && (
                <View style={styles.detailItem}>
                  <Bath color={colors.textTertiary} size={16} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>{property.details.bathrooms}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Square color={colors.textTertiary} size={16} />
                <Text style={[styles.detailText, { color: colors.textTertiary }]}>{property.details.area} م²</Text>
              </View>
            </View>
            
            {property.features.length > 0 && (
              <View style={styles.featuresContainer}>
                <Text style={[styles.featuresText, { color: colors.textMuted }]}>
                  {property.features.slice(0, 3).join(' • ')}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <CustomHeader 
        titleEn="Properties"
        titleAr="العقارات"
        showLogo={true}
      />
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Search color={colors.textTertiary} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="ابحث عن العقارات..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={refreshProperties}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <RefreshCw color={isLoading ? colors.textMuted : colors.tint} size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Filter color={colors.tint} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.typeFilterButton, 
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              selectedType === 'all' && { backgroundColor: colors.tint }
            ]}
            onPress={() => handleTypeFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeFilterText, 
              { color: colors.textSecondary },
              selectedType === 'all' && { color: '#FFFFFF' }
            ]}>
              الكل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeFilterButton, 
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              selectedType === 'apartment' && { backgroundColor: colors.tint }
            ]}
            onPress={() => handleTypeFilter('apartment')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeFilterText, 
              { color: colors.textSecondary },
              selectedType === 'apartment' && { color: '#FFFFFF' }
            ]}>
              شقق
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeFilterButton, 
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              selectedType === 'villa' && { backgroundColor: colors.tint }
            ]}
            onPress={() => handleTypeFilter('villa')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeFilterText, 
              { color: colors.textSecondary },
              selectedType === 'villa' && { color: '#FFFFFF' }
            ]}>
              فلل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeFilterButton, 
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              selectedType === 'office' && { backgroundColor: colors.tint }
            ]}
            onPress={() => handleTypeFilter('office')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeFilterText, 
              { color: colors.textSecondary },
              selectedType === 'office' && { color: '#FFFFFF' }
            ]}>
              مكاتب
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeFilterButton, 
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              selectedType === 'land' && { backgroundColor: colors.tint }
            ]}
            onPress={() => handleTypeFilter('land')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeFilterText, 
              { color: colors.textSecondary },
              selectedType === 'land' && { color: '#FFFFFF' }
            ]}>
              أراضي
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={[styles.resultsHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsCount, { color: colors.text }]}>
            {filteredProperties.length} عقار متاح
          </Text>
          {isLoading && (
            <Text style={[styles.loadingText, { color: colors.tint }]}>جاري التحديث...</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.propertiesList} contentContainerStyle={styles.propertiesContent}>
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
        
        {filteredProperties.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>لا توجد عقارات تطابق البحث</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
              جرب تغيير معايير البحث أو المرشحات
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
  },
  refreshButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
  },
  filterButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    marginLeft: Spacing.sm,
    textAlign: 'right',
    fontWeight: Typography.fontWeights.medium,
  },
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingRight: Spacing.xs,
  },
  typeFilterButton: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginLeft: Spacing.sm,
    borderWidth: 1,
  },
  typeFilterText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: Typography.fontSizes.sm,
    fontStyle: 'italic',
    fontWeight: Typography.fontWeights.medium,
  },
  propertiesList: {
    flex: 1,
  },
  propertiesContent: {
    padding: Spacing.lg,
  },
  propertyCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 220,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  statusBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  propertyInfo: {
    padding: Spacing.lg,
  },
  propertyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.xs,
    textAlign: 'right',
    lineHeight: Typography.lineHeights.tight * Typography.fontSizes.lg,
  },
  propertyPrice: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    justifyContent: 'flex-end',
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    marginRight: Spacing.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: Typography.fontSizes.sm,
    marginRight: Spacing.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  featuresContainer: {
    marginTop: Spacing.sm,
  },
  featuresText: {
    fontSize: Typography.fontSizes.xs,
    textAlign: 'right',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
  },
  emptyStateText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
});