import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SignInData } from '@/types/auth';

export default function SignInScreen() {
  const { signIn, resetPassword, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<SignInData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInData> = {};

    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await signIn(formData);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      // Handle specific Supabase errors
      if (errorMessage.includes('Invalid login credentials')) {
        Alert.alert(t('error'), 'Invalid email or password. Please try again.');
      } else if (errorMessage.includes('Email not confirmed')) {
        Alert.alert(t('error'), 'Please check your email and confirm your account before signing in.');
      } else if (errorMessage.includes('Too many requests')) {
        Alert.alert(t('error'), 'Too many sign in attempts. Please wait a moment and try again.');
      } else {
        Alert.alert(t('error'), errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      Alert.alert(t('error'), 'Please enter your email address first.');
      return;
    }
    
    Alert.alert(
      'Reset Password',
      'A password reset link will be sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            try {
              await resetPassword(formData.email);
              Alert.alert('Success', 'Password reset link sent to your email.');
            } catch (resetError) {
              console.error('Reset password error:', resetError);
              Alert.alert(t('error'), 'Failed to send reset link. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('welcomeBack')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              {t('signIn')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('email')}
              value={formData.email}
              onChangeText={(email) => setFormData({ ...formData, email })}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="email-input"
            />

            <Input
              label={t('password')}
              value={formData.password}
              onChangeText={(password) => setFormData({ ...formData, password })}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
              testID="password-input"
            />

            <Button
              title={t('signIn')}
              onPress={handleSignIn}
              loading={isSubmitting}
              disabled={isLoading}
              style={styles.signInButton}
              testID="sign-in-button"
            />
            
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              testID="forgot-password-button"
            >
              <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.guestButton, { borderColor: colors.border }]}
              onPress={() => router.replace('/(tabs)')}
              testID="continue-as-guest-button"
            >
              <Text style={[styles.guestButtonText, { color: colors.placeholder }]}>
                {t('continueAsGuest')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.signUpLink}>
              <Text style={[styles.footerText, { color: colors.placeholder }]}>
                {t('dontHaveAccount')}{' '}
              </Text>
              <Link href="/auth/sign-up">
                <Text style={[styles.link, { color: colors.tint }]}>
                  {t('signUp')}
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 32,
  },
  signInButton: {
    marginTop: 8,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signUpLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});