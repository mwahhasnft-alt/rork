import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Phone,
  Mail,
  Car,
  Star,
  Share,
} from 'lucide-react-native';
import { useProperties } from '@/contexts/PropertyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SAUDI_PROPERTIES } from '@/constants/property-data';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, toggleFavorite } = useProperties();
  const { colors, shadows } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = SAUDI_PROPERTIES.find(p => p.id === id);

  if (!property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>العقار غير موجود</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.tint }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isFavorite = favorites.includes(property.id);

  const handleCall = () => {
    if (property.agent?.phone) {
      Linking.openURL(`tel:${property.agent.phone}`);
    }
  };

  const handleEmail = () => {
    if (property.agent?.email) {
      Linking.openURL(`mailto:${property.agent.email}`);
    }
  };

  const handleShare = () => {
    Alert.alert('مشاركة العقار', 'سيتم إضافة ميزة المشاركة قريباً');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-SA');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => toggleFavorite(property.id)}
            >
              <Heart 
                color={isFavorite ? "#FF3B30" : "#FFFFFF"} 
                size={20} 
                fill={isFavorite ? "#FF3B30" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {property.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {property.status === 'available' ? 'متاح' : 'غير متاح'}
            </Text>
          </View>
        </View>

        {/* Property Info */}
        <View style={[styles.propertyInfo, { backgroundColor: colors.card }, shadows.medium]}>
          <Text style={[styles.propertyTitle, { color: colors.text }]}>{property.title}</Text>
          <Text style={[styles.propertyPrice, { color: colors.tint }]}>
            {formatPrice(property.price)} {property.currency}
          </Text>
          
          <View style={styles.locationContainer}>
            <MapPin color={colors.textMuted} size={16} />
            <Text style={[styles.locationText, { color: colors.textMuted }]}>
              {property.location.district}، {property.location.city}
            </Text>
          </View>

          {/* Property Details */}
          <View style={styles.detailsGrid}>
            {property.details.bedrooms && property.details.bedrooms > 0 && (
              <View style={[styles.detailCard, { backgroundColor: colors.backgroundSecondary }]}>
                <Bed color={colors.tint} size={24} />
                <Text style={[styles.detailNumber, { color: colors.text }]}>{property.details.bedrooms}</Text>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>غرف نوم</Text>
              </View>
            )}
            {property.details.bathrooms && (
              <View style={[styles.detailCard, { backgroundColor: colors.backgroundSecondary }]}>
                <Bath color={colors.tint} size={24} />
                <Text style={[styles.detailNumber, { color: colors.text }]}>{property.details.bathrooms}</Text>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>حمامات</Text>
              </View>
            )}
            <View style={[styles.detailCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Square color={colors.tint} size={24} />
              <Text style={[styles.detailNumber, { color: colors.text }]}>{property.details.area}</Text>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>م²</Text>
            </View>
            {property.details.parking && (
              <View style={[styles.detailCard, { backgroundColor: colors.backgroundSecondary }]}>
                <Car color={colors.tint} size={24} />
                <Text style={[styles.detailNumber, { color: colors.text }]}>✓</Text>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>موقف</Text>
              </View>
            )}
          </View>

          {/* Additional Details */}
          <View style={[styles.additionalDetails, { backgroundColor: colors.backgroundSecondary }]}>
            {property.details.floor && (
              <View style={[styles.additionalDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.additionalDetailLabel, { color: colors.textMuted }]}>الطابق:</Text>
                <Text style={[styles.additionalDetailValue, { color: colors.text }]}>
                  {property.details.floor}
                  {property.details.totalFloors && ` من ${property.details.totalFloors}`}
                </Text>
              </View>
            )}
            {property.details.yearBuilt && (
              <View style={[styles.additionalDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.additionalDetailLabel, { color: colors.textMuted }]}>سنة البناء:</Text>
                <Text style={[styles.additionalDetailValue, { color: colors.text }]}>{property.details.yearBuilt}</Text>
              </View>
            )}
            <View style={[styles.additionalDetailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.additionalDetailLabel, { color: colors.textMuted }]}>مفروش:</Text>
              <Text style={[styles.additionalDetailValue, { color: colors.text }]}>
                {property.details.furnished ? 'نعم' : 'لا'}
              </Text>
            </View>
            <View style={[styles.additionalDetailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.additionalDetailLabel, { color: colors.textMuted }]}>تاريخ الإضافة:</Text>
              <Text style={[styles.additionalDetailValue, { color: colors.text }]}>{formatDate(property.createdAt)}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>الوصف</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{property.description}</Text>
          </View>

          {/* Features */}
          {property.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>المميزات</Text>
              <View style={styles.featuresGrid}>
                {property.features.map((feature, index) => (
                  <View key={index} style={[styles.featureTag, { backgroundColor: colors.backgroundTertiary }]}>
                    <Star color={colors.tint} size={14} />
                    <Text style={[styles.featureText, { color: colors.tint }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Agent Info */}
          {property.agent && (
            <View style={styles.agentSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>معلومات الوسيط</Text>
              <View style={[styles.agentCard, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.agentInfo}>
                  {property.agent.avatar ? (
                    <Image source={{ uri: property.agent.avatar }} style={styles.agentAvatar} />
                  ) : (
                    <View style={[styles.agentAvatarPlaceholder, { backgroundColor: colors.tint }]}>
                      <Text style={styles.agentInitial}>
                        {property.agent.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.agentDetails}>
                    <Text style={[styles.agentName, { color: colors.text }]}>{property.agent.name}</Text>
                    <Text style={[styles.agentTitle, { color: colors.textMuted }]}>وسيط عقاري</Text>
                  </View>
                </View>
                <View style={styles.agentActions}>
                  <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.tint }]} onPress={handleCall}>
                    <Phone color="#FFFFFF" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.tint }]} onPress={handleEmail}>
                    <Mail color="#FFFFFF" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }, shadows.medium]}>
        <TouchableOpacity style={[styles.contactMainButton, { backgroundColor: colors.tint }]} onPress={handleCall}>
          <Phone color="#FFFFFF" size={20} />
          <Text style={styles.contactMainButtonText}>اتصل الآن</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.favoriteMainButton, { backgroundColor: colors.backgroundSecondary }]} onPress={() => toggleFavorite(property.id)}>
          <Heart 
            color={isFavorite ? colors.error : colors.textMuted} 
            size={20} 
            fill={isFavorite ? colors.error : "transparent"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  propertyInfo: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 16,
    marginRight: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  detailNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  additionalDetails: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  additionalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  additionalDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  additionalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  agentSection: {
    marginBottom: 24,
  },
  agentCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  agentAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },
  agentTitle: {
    fontSize: 12,
    textAlign: 'right',
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    borderRadius: 20,
    padding: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    flexDirection: 'row',
    gap: 12,
  },
  contactMainButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  contactMainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteMainButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});