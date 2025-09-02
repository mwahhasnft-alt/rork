import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import Colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof Colors.light;
  gradients: typeof Colors.gradients.light;
  shadows: typeof Colors.shadows.light;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const THEME_STORAGE_KEY = 'theme_mode';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };

  const theme = getEffectiveTheme(themeMode);
  const colors = Colors[theme];
  const gradients = Colors.gradients[theme];
  const shadows = Colors.shadows[theme];

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, []);

  return {
    theme,
    themeMode,
    colors,
    gradients,
    shadows,
    setThemeMode,
    isLoading,
  };
});