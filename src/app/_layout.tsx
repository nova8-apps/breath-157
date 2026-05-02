import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PreviewErrorReporter } from '@/components/PreviewErrorReporter';
import { PreviewModeBanner } from '@/components/PreviewModeBanner';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <PreviewErrorReporter>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <GluestackUIProvider mode="dark">
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0a0e27' },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="session"
                  options={{ animation: 'fade', gestureEnabled: false }}
                />
                <Stack.Screen
                  name="session-complete"
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="pattern-editor"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="help"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
              </Stack>
              <PreviewModeBanner />
              <StatusBar style="light" />
            </GluestackUIProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </PreviewErrorReporter>
  );
}
