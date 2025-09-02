import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AIServiceProvider } from "@/contexts/AIServiceContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { trpc, trpcClient } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <PropertyProvider>
                <AIServiceProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <ErrorBoundary testID="root-error-boundary">
                      <RootLayoutNav />
                    </ErrorBoundary>
                  </GestureHandlerRootView>
                </AIServiceProvider>
              </PropertyProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
