import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { I18nManager } from 'react-native';
import { translations, Language, TranslationKey, supportedLanguages } from '@/constants/languages';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
  isRTL: boolean;
  currentLanguageInfo: typeof supportedLanguages[0];
}

const LANGUAGE_STORAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      const languageInfo = supportedLanguages.find(l => l.code === lang);
      const isRTL = languageInfo?.rtl || false;
      
      // Update RTL layout
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      setLanguageState(lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && savedLanguage in translations) {
          const lang = savedLanguage as Language;
          const languageInfo = supportedLanguages.find(l => l.code === lang);
          const isRTL = languageInfo?.rtl || false;
          
          // Set RTL layout
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
          
          setLanguageState(lang);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const currentLanguageInfo = useMemo(() => 
    supportedLanguages.find(l => l.code === language) || supportedLanguages[0], 
    [language]
  );
  const isRTL = currentLanguageInfo.rtl;

  return useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading,
    isRTL,
    currentLanguageInfo,
  }), [language, setLanguage, t, isLoading, isRTL, currentLanguageInfo]);
});