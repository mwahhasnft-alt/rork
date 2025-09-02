import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

import { Typography, Spacing, BorderRadius } from '@/constants/colors';

interface CustomHeaderProps {
  titleEn: string;
  titleAr: string;
  showLogo?: boolean;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

export function CustomHeader({ 
  titleEn, 
  titleAr, 
  showLogo = true,
  rightComponent,
  leftComponent 
}: CustomHeaderProps) {
  const { colors, shadows } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Left side - English title */}
        <View style={styles.leftSection}>
          {leftComponent || (
            <Text style={[styles.titleEn, { color: colors.text }]}>
              {titleEn}
            </Text>
          )}
        </View>

        {/* Center - Logo */}
        {showLogo && (
          <View style={styles.centerSection}>
            <View style={[styles.logoContainer, shadows.small]}>
              <View style={styles.logoGradient}>
                <Text style={styles.logoText}>A</Text>
              </View>
            </View>
          </View>
        )}

        {/* Right side - Arabic title */}
        <View style={styles.rightSection}>
          {rightComponent || (
            <Text style={[styles.titleAr, { color: colors.text }]}>
              {titleAr}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleEn: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  titleAr: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    letterSpacing: Typography.letterSpacing.wide,
  },
});