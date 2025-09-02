import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  MessageSquare, 
  Star,
  ChevronRight,
  Moon,
  Volume2,
  Smartphone,
  LogOut,
  Sun,
  Monitor,
  Check,
  X
} from 'lucide-react-native';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supportedLanguages, Language } from '@/constants/languages';
import { router } from 'expo-router';

type SettingItem = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
};

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { colors, shadows, theme, themeMode, setThemeMode } = useTheme();
  const { t, language, setLanguage, currentLanguageInfo, isRTL } = useLanguage();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('signOut'), 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/sign-in');
          }
        },
      ]
    );
  };

  const handleLanguageSelect = async (lang: Language) => {
    try {
      await setLanguage(lang);
      setLanguageModalVisible(false);
      Alert.alert(
        t('languageChanged'),
        t('languageChangedMessage')
      );
    } catch (error) {
      console.error('Failed to change language:', error);
      Alert.alert(t('error'), 'Failed to change language');
    }
  };

  const handleThemeChange = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return <Sun color={colors.warning} size={20} />;
      case 'dark': return <Moon color={colors.info} size={20} />;
      case 'system': return <Monitor color={colors.tint} size={20} />;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return t('light');
      case 'dark': return t('dark');
      case 'system': return t('system');
    }
  };

  const settingSections = [
    {
      title: t('appearance'),
      items: [
        {
          title: t('theme'),
          subtitle: getThemeLabel(),
          icon: getThemeIcon(),
          type: 'navigation' as const,
          onPress: handleThemeChange,
        },
        {
          title: t('notifications'),
          subtitle: t('notificationsDescription'),
          icon: <Bell color={colors.tint} size={20} />,
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          title: t('sounds'),
          subtitle: t('soundsDescription'),
          icon: <Volume2 color={colors.success} size={20} />,
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          title: t('voiceAssistant'),
          subtitle: t('voiceAssistantDescription'),
          icon: <Smartphone color={colors.warning} size={20} />,
          type: 'toggle' as const,
          value: voiceEnabled,
          onToggle: setVoiceEnabled,
        },
      ],
    },
    {
      title: t('accountPrivacy'),
      items: [
        {
          title: t('language'),
          subtitle: currentLanguageInfo.nativeName,
          icon: <Globe color={colors.tint} size={20} />,
          type: 'navigation' as const,
          onPress: () => setLanguageModalVisible(true),
        },
        {
          title: t('privacy'),
          subtitle: t('privacyDescription'),
          icon: <Shield color={colors.success} size={20} />,
          type: 'navigation' as const,
          onPress: () => Alert.alert(t('privacy'), t('privacySettings')),
        },
      ],
    },
    {
      title: t('supportHelp'),
      items: [
        {
          title: t('helpCenter'),
          subtitle: t('helpCenterDescription'),
          icon: <HelpCircle color={colors.info} size={20} />,
          type: 'navigation' as const,
          onPress: () => Alert.alert(t('helpCenter'), t('helpSupport')),
        },
        {
          title: t('contactUs'),
          subtitle: t('contactUsDescription'),
          icon: <MessageSquare color={colors.tint} size={20} />,
          type: 'navigation' as const,
          onPress: () => Alert.alert(t('contactUs'), t('contactEmail')),
        },
        {
          title: t('rateApp'),
          subtitle: t('rateAppDescription'),
          icon: <Star color={colors.warning} size={20} />,
          type: 'navigation' as const,
          onPress: () => Alert.alert(t('thankYou'), t('thankYouMessage')),
        },
      ],
    },
    {
      title: t('other'),
      items: [
        {
          title: t('signOut'),
          icon: <LogOut color={colors.error} size={20} />,
          type: 'action' as const,
          destructive: true,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  const SettingItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={[styles.settingItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.settingIcon, { backgroundColor: colors.backgroundTertiary, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }]}>
          {item.icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: item.destructive ? colors.error : colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.tint }}
            thumbColor="#FFFFFF"
          />
        )}
        {item.type === 'navigation' && (
          <ChevronRight 
            color={colors.textTertiary} 
            size={20} 
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const LanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardElevated, ...shadows.large }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('selectLanguage')}
            </Text>
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <X color={colors.textTertiary} size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={supportedLanguages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.languageItem, { borderBottomColor: colors.border }]}
                onPress={() => handleLanguageSelect(item.code)}
              >
                <View style={styles.languageItemLeft}>
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <View>
                    <Text style={[styles.languageName, { color: colors.text }]}>
                      {item.nativeName}
                    </Text>
                    <Text style={[styles.languageEnglishName, { color: colors.textSecondary }]}>
                      {item.name}
                    </Text>
                  </View>
                </View>
                {language === item.code && (
                  <Check color={colors.tint} size={20} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.cardElevated, borderBottomColor: colors.border, ...shadows.small }]}>
        <Text style={[styles.headerTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('settings')}
        </Text>
        {user && (
          <Text style={[styles.userEmail, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {user.email}
          </Text>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary, textAlign: isRTL ? 'right' : 'left' }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.cardElevated, borderColor: colors.border, ...shadows.small }]}>
              {section.items.map((item, itemIndex) => (
                <SettingItem key={itemIndex} item={item} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tint }]}>Property AI</Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.copyrightText, { color: colors.textTertiary }]}>
            © 2024 Property AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
      
      <LanguageModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 3,
    fontWeight: '500',
  },
  settingRight: {
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageEnglishName: {
    fontSize: 14,
    marginTop: 2,
  },
});