import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, BorderRadius, Spacing } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
  fullWidth = false,
}) => {
  const { colors, shadows } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...(fullWidth && { width: '100%' }),
    };

    const sizeStyles = {
      xs: { 
        paddingHorizontal: Spacing.md, 
        paddingVertical: Spacing.xs, 
        minHeight: 32 
      },
      sm: { 
        paddingHorizontal: Spacing.lg, 
        paddingVertical: Spacing.sm, 
        minHeight: 40 
      },
      md: { 
        paddingHorizontal: Spacing.xl, 
        paddingVertical: Spacing.md, 
        minHeight: 48 
      },
      lg: { 
        paddingHorizontal: Spacing['2xl'], 
        paddingVertical: Spacing.lg, 
        minHeight: 56 
      },
      xl: { 
        paddingHorizontal: Spacing['3xl'], 
        paddingVertical: Spacing.xl, 
        minHeight: 64 
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.tint,
        ...shadows.medium,
      },
      secondary: {
        backgroundColor: colors.cardElevated,
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.tint,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      accent: {
        backgroundColor: colors.accent,
        ...shadows.medium,
      },
      destructive: {
        backgroundColor: colors.destructive,
        ...shadows.medium,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      xs: { 
        fontSize: Typography.fontSizes.sm, 
        fontWeight: Typography.fontWeights.semibold, 
        letterSpacing: Typography.letterSpacing.normal 
      },
      sm: { 
        fontSize: Typography.fontSizes.sm, 
        fontWeight: Typography.fontWeights.semibold, 
        letterSpacing: Typography.letterSpacing.normal 
      },
      md: { 
        fontSize: Typography.fontSizes.base, 
        fontWeight: Typography.fontWeights.semibold, 
        letterSpacing: Typography.letterSpacing.wide 
      },
      lg: { 
        fontSize: Typography.fontSizes.lg, 
        fontWeight: Typography.fontWeights.bold, 
        letterSpacing: Typography.letterSpacing.wide 
      },
      xl: { 
        fontSize: Typography.fontSizes.xl, 
        fontWeight: Typography.fontWeights.bold, 
        letterSpacing: Typography.letterSpacing.wide 
      },
    };

    const variantStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: colors.text },
      outline: { color: colors.tint },
      ghost: { color: colors.tint },
      accent: { color: '#FFFFFF' },
      destructive: { color: '#FFFFFF' },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'accent' || variant === 'destructive' ? '#FFFFFF' : colors.tint}
          style={{ marginRight: Spacing.sm }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

