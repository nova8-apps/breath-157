import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useAppStore } from '@/lib/store';

export default function IndexRouter() {
  const hasSeenOnboarding = useAppStore((s) => s.profile.hasSeenOnboarding);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasSeenOnboarding) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [hasSeenOnboarding]);

  return <View style={{ flex: 1, backgroundColor: '#0a0e27' }} />;
}
