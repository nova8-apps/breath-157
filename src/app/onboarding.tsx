import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  type ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wind, Heart, Sparkles, Moon, ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';

interface OnboardingCard {
  id: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  accent: string;
}

const ONBOARDING_CARDS: OnboardingCard[] = [
  {
    id: 'welcome',
    title: 'Breathe with intention',
    body: 'Short, guided breathing sessions to quiet the noise and bring you back to center — anytime you need it.',
    Icon: Wind,
    accent: colors.primary,
  },
  {
    id: 'patterns',
    title: 'Patterns for every moment',
    body: 'Box breathing for focus. 4-7-8 for sleep. Energize to wake up. Pick a rhythm that matches how you want to feel.',
    Icon: Sparkles,
    accent: colors.hold,
  },
  {
    id: 'streaks',
    title: 'Build a calm habit',
    body: 'Track sessions, build streaks, and watch your minutes of mindfulness add up. Small, consistent practice changes everything.',
    Icon: Heart,
    accent: colors.exhale,
  },
  {
    id: 'ready',
    title: "Let's begin",
    body: 'Your first session is just a tap away. Find a quiet spot, get comfortable, and let your breath lead the way.',
    Icon: Moon,
    accent: colors.primaryLight,
  },
];

const { width: SCREEN_W } = Dimensions.get('window');

function BreathingHero({ accent }: { accent: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.18, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: accent,
            opacity: 0.08,
          },
          animStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: accent,
            opacity: 0.18,
          },
          animStyle,
        ]}
      />
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: accent,
          shadowOpacity: 0.6,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

function CardSlide({ card }: { card: OnboardingCard }) {
  const Icon = card.Icon;
  return (
    <View
      style={{
        width: SCREEN_W,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <BreathingHero accent={card.accent} />
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255,255,255,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Icon size={26} color={card.accent} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 28,
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: 14,
          letterSpacing: -0.5,
        }}
      >
        {card.title}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        {card.body}
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingCard>>(null);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const isLast = currentIndex === ONBOARDING_CARDS.length - 1;
  const accent = ONBOARDING_CARDS[currentIndex]?.accent ?? colors.primary;

  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete();
      router.replace('/(tabs)/home');
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };

  const handleSkip = () => {
    setOnboardingComplete();
    router.replace('/(tabs)/home');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Skip */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <Pressable
          onPress={handleSkip}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 8 })}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              color: colors.textSecondary,
              fontSize: 15,
            }}
          >
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_CARDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardSlide card={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
      />

      {/* Page indicators */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {ONBOARDING_CARDS.map((c, i) => (
          <View
            key={c.id}
            style={{
              height: 6,
              width: i === currentIndex ? 24 : 6,
              borderRadius: 3,
              backgroundColor:
                i === currentIndex ? accent : 'rgba(255,255,255,0.18)',
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            backgroundColor: accent,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: accent,
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          })}
        >
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              color: '#0a0e27',
              fontSize: 16,
              letterSpacing: 0.2,
            }}
          >
            {isLast ? 'Start your first session' : 'Continue'}
          </Text>
          <ChevronRight size={18} color="#0a0e27" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}
