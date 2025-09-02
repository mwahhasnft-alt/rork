import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, BorderRadius, Spacing } from '@/constants/colors';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  secureTextEntry?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  inputStyle,
  secureTextEntry,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { colors, shadows } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const isPassword = secureTextEntry;
  const showPassword = isPassword && !isPasswordVisible;

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 40,
        fontSize: Typography.fontSizes.sm,
      },
      md: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 48,
        fontSize: Typography.fontSizes.base,
      },
      lg: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: 56,
        fontSize: Typography.fontSizes.lg,
      },
    };
    return sizeStyles[size];
  };

  const getVariantStyles = () => {
    const variantStyles = {
      default: {
        borderWidth: 1,
        borderColor: error ? colors.error : (isFocused ? colors.inputFocused : colors.inputBorder),
        backgroundColor: colors.input,
        ...(isFocused ? shadows.small : {}),
      },
      filled: {
        borderWidth: 0,
        backgroundColor: colors.backgroundSecondary,
        ...(isFocused && {
          borderWidth: 2,
          borderColor: colors.inputFocused,
        }),
        ...(error && {
          borderWidth: 2,
          borderColor: colors.error,
        }),
      },
      outlined: {
        borderWidth: 2,
        borderColor: error ? colors.error : (isFocused ? colors.inputFocused : colors.border),
        backgroundColor: 'transparent',
      },
    };
    return variantStyles[variant];
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        getSizeStyles(),
        getVariantStyles(),
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: getSizeStyles().fontSize,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
            testID="password-toggle"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
    letterSpacing: Typography.letterSpacing.normal,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  input: {
    fontWeight: Typography.fontWeights.medium,
    letterSpacing: Typography.letterSpacing.normal,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  eyeIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  hint: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeights.normal,
  },
});