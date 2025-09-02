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
import { SignUpData } from '@/types/auth';

export default function SignUpScreen() {
  const { signUp, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpData> = {};

    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await signUp(formData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
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
              {t('getStarted')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.placeholder }]}>
              {t('createAccount')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={`${t('name')} (${t('optional')})`}
              value={formData.name || ''}
              onChangeText={(name) => setFormData({ ...formData, name })}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              testID="name-input"
            />
            
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
              autoComplete="new-password"
              testID="password-input"
            />

            <Input
              label={t('confirmPassword')}
              value={formData.confirmPassword}
              onChangeText={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
              error={errors.confirmPassword}
              secureTextEntry
              autoComplete="new-password"
              testID="confirm-password-input"
            />

            <Button
              title={t('signUp')}
              onPress={handleSignUp}
              loading={isSubmitting}
              disabled={isLoading}
              style={styles.signUpButton}
              testID="sign-up-button"
            />
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
            
            <View style={styles.signInLink}>
              <Text style={[styles.footerText, { color: colors.placeholder }]}>
                {t('alreadyHaveAccount')}{' '}
              </Text>
              <Link href="/auth/sign-in">
                <Text style={[styles.link, { color: colors.tint }]}>
                  {t('signIn')}
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
  signUpButton: {
    marginTop: 8,
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
  signInLink: {
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