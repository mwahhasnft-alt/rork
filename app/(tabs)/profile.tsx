import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { 
  User, 
  Heart, 
  Eye, 
  MessageSquare, 
  Star, 
  Award,
  ChevronRight,
  LogIn,
  UserPlus
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';

const profileStats = [
  { label: 'العقارات المحفوظة', value: '12', icon: <Heart color="#FF3B30" size={20} /> },
  { label: 'العقارات المشاهدة', value: '45', icon: <Eye color="#007AFF" size={20} /> },
  { label: 'الاستشارات', value: '8', icon: <MessageSquare color="#34C759" size={20} /> },
  { label: 'التقييم', value: '4.8', icon: <Star color="#FF9500" size={20} /> },
];

const menuItems = [
  { title: 'العقارات المحفوظة', icon: <Heart color="#8E8E93" size={20} />, hasChevron: true },
  { title: 'العقارات المشاهدة مؤخراً', icon: <Eye color="#8E8E93" size={20} />, hasChevron: true },
  { title: 'الاستشارات السابقة', icon: <MessageSquare color="#8E8E93" size={20} />, hasChevron: true },
  { title: 'الإنجازات', icon: <Award color="#8E8E93" size={20} />, hasChevron: true },
];

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const StatCard = ({ stat }: { stat: typeof profileStats[0] }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statIcon}>{stat.icon}</View>
      <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
      <Text style={[styles.statLabel, { color: colors.placeholder }]}>{stat.label}</Text>
    </View>
  );

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        {item.icon}
        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
      </View>
      {item.hasChevron && <ChevronRight color={colors.placeholder} size={20} />}
    </TouchableOpacity>
  );

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CustomHeader 
          titleEn="Profile"
          titleAr="الملف الشخصي"
          showLogo={true}
        />
        <View style={styles.guestContainer}>
          <View style={styles.guestHeader}>
            <View style={[styles.guestAvatar, { backgroundColor: colors.card }]}>
              <User color={colors.placeholder} size={40} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.text }]}>
              {t('welcomeGuest')}
            </Text>
            <Text style={[styles.guestSubtitle, { color: colors.placeholder }]}>
              {t('signInToAccessFeatures')}
            </Text>
          </View>

          <View style={styles.guestActions}>
            <Button
              title={t('signIn')}
              onPress={() => router.push('/auth/sign-in')}
              style={styles.signInButton}
              testID="guest-sign-in-button"
            />
            
            <TouchableOpacity
              style={[styles.signUpButton, { borderColor: colors.tint }]}
              onPress={() => router.push('/auth/sign-up')}
              testID="guest-sign-up-button"
            >
              <UserPlus color={colors.tint} size={20} />
              <Text style={[styles.signUpButtonText, { color: colors.tint }]}>
                {t('createAccount')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.guestFeatures, { backgroundColor: colors.card }]}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>
              {t('featuresAvailableAfterSignIn')}
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Heart color={colors.tint} size={16} />
                <Text style={[styles.featureText, { color: colors.placeholder }]}>
                  {t('saveProperties')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Eye color={colors.tint} size={16} />
                <Text style={[styles.featureText, { color: colors.placeholder }]}>
                  {t('viewHistory')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MessageSquare color={colors.tint} size={16} />
                <Text style={[styles.featureText, { color: colors.placeholder }]}>
                  {t('consultations')}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Star color={colors.tint} size={16} />
                <Text style={[styles.featureText, { color: colors.placeholder }]}>
                  {t('personalizedRecommendations')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader 
        titleEn="Profile"
        titleAr="الملف الشخصي"
        showLogo={true}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.placeholder }]}>{user?.email}</Text>
          <Text style={[styles.userLocation, { color: colors.placeholder }]}>الرياض، المملكة العربية السعودية</Text>
          
          <View style={styles.profileActions}>
            <TouchableOpacity style={[styles.editButton, { borderColor: colors.tint }]}>
              <User color={colors.tint} size={16} />
              <Text style={[styles.editButtonText, { color: colors.tint }]}>تعديل الملف الشخصي</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.signOutButton, { backgroundColor: colors.destructive }]}
              onPress={handleSignOut}
              testID="sign-out-button"
            >
              <LogIn color="white" size={16} />
              <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statsSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>إحصائياتي</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </View>
        </View>

        <View style={[styles.achievementsSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الإنجازات الأخيرة</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Award color="#FF9500" size={24} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>مستخدم نشط</Text>
                <Text style={[styles.achievementDescription, { color: colors.placeholder }]}>
                  تم تحقيق هذا الإنجاز لاستخدام التطبيق لأكثر من 30 يوماً
                </Text>
              </View>
            </View>
            
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Star color="#34C759" size={24} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>خبير عقاري</Text>
                <Text style={[styles.achievementDescription, { color: colors.placeholder }]}>
                  تم تحقيق هذا الإنجاز لمشاهدة أكثر من 50 عقار
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>نشاطي</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <MenuItem key={index} item={item} />
            ))}
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>رؤى شخصية</Text>
          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>🎯 اهتماماتك</Text>
            <Text style={[styles.insightText, { color: colors.placeholder }]}>
              تظهر بياناتك اهتماماً كبيراً بالشقق في حي العليا والروضة، 
              مع تفضيل للعقارات التي تتراوح بين 700,000 - 1,000,000 ريال
            </Text>
          </View>
          
          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>📊 توصية ذكية</Text>
            <Text style={[styles.insightText, { color: colors.placeholder }]}>
              بناءً على نشاطك، ننصحك بمتابعة العقارات الجديدة في حي النرجس 
              حيث تتوافق مع معايير البحث الخاصة بك
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  guestActions: {
    marginBottom: 32,
  },
  signInButton: {
    marginBottom: 16,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  guestFeatures: {
    borderRadius: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F8F8',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  userLocation: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  statsSection: {
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementsSection: {
    padding: 20,
    marginTop: 12,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  menuSection: {
    padding: 20,
    marginTop: 12,
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginRight: 12,
  },
  insightsSection: {
    padding: 20,
    marginTop: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
});