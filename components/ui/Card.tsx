import React from 'react';
import {
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'property';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  testID?: string;
  borderRadius?: keyof typeof BorderRadius;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  testID,
  borderRadius = 'xl',
}) => {
  const { colors, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius[borderRadius],
      overflow: 'hidden',
    };

    const paddingStyles = {
      none: {},
      xs: { padding: Spacing.xs },
      sm: { padding: Spacing.sm },
      md: { padding: Spacing.lg },
      lg: { padding: Spacing.xl },
      xl: { padding: Spacing['2xl'] },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.card,
        ...shadows.small,
      },
      elevated: {
        backgroundColor: colors.cardElevated,
        ...shadows.medium,
      },
      outlined: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      property: {
        backgroundColor: colors.card,
        ...shadows.large,
        borderWidth: 1,
        borderColor: colors.borderTertiary,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyle(), style]} testID={testID}>
      {children}
    </View>
  );
};