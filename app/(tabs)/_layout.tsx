import { Tabs } from "expo-router";
import { MessageCircle, Building, TrendingUp, User, Settings, Database } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Typography, Spacing } from "@/constants/colors";

export default function TabLayout() {
  const { colors, shadows, theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardElevated,
          borderTopWidth: 0,
          paddingTop: Spacing.md,
          paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.md,
          paddingHorizontal: Spacing.sm,
          height: Platform.OS === 'ios' ? 88 : 72,
          ...shadows.large,
          ...(theme === 'dark' && {
            borderTopWidth: 0.5,
            borderTopColor: colors.border,
          }),
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSizes.xs,
          fontWeight: Typography.fontWeights.semibold,
          marginTop: Spacing.xs,
          letterSpacing: Typography.letterSpacing.wide,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('chat'),
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: t('properties'),
          tabBarIcon: ({ color, size }) => <Building color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t('admin'),
          tabBarIcon: ({ color, size }) => <Database color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}