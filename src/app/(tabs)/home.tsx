import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Play, ChevronRight, Square, Moon, Sun, Zap, CloudMoon, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { BreathPattern } from '@/types';

const PATTERN_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  square: Square,
  moon: Moon,
  sun: Sun,
  zap: Zap,
  'cloud-moon': CloudMoon,
};

// Floating particle component
function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0.4, { duration: 800, easing: Easing.ease });
    translateY.value = withRepeat(
      withTiming(-20, { duration: 3000 + delay * 100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [delay]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.primary,
        },
        animStyle,
      ]}
    />
  );
}

// Background breathing circle (large ambient)
function BackgroundBreathingCircle() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -80,
          alignSelf: 'center',
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: colors.primaryGlow,
          opacity: 0.15,
        },
        animStyle,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.primary,
          opacity: 0.12,
        }}
      />
    </Animated.View>
  );
}

// Compact pattern card for 2x2 grid
function CompactPatternCard({ pattern, onPress }: { pattern: BreathPattern; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = PATTERN_ICONS[pattern.icon] ?? Square;
  const cycleSec = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;
  const totalMin = Math.round((cycleSec * pattern.cycles) / 60);

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 14, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
      onPress={onPress}
      accessibilityLabel={`Select ${pattern.name} pattern`}
      testID={`pattern-${pattern.id}`}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          animStyle,
          {
            backgroundColor: colors.bgCard,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 90,
          },
        ]}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: pattern.isPremium ? 'rgba(139,92,246,0.15)' : colors.primaryGlow,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <IconComponent size={18} color={pattern.isPremium ? '#8b5cf6' : colors.primary} />
        </View>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: colors.textPrimary,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {pattern.name}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: colors.textSecondary,
          }}
        >
          {totalMin} min
        </Text>
        {pattern.isPremium && (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: 'rgba(139,92,246,0.2)',
              borderRadius: 6,
              paddingHorizontal: 5,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#8b5cf6' }}>PRO</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// Radial streak progress ring
function StreakRing({ current, longest }: { current: number; longest: number }) {
  const progress = longest > 0 ? Math.min(current / longest, 1) : 0;
  const circumference = 2 * Math.PI * 18; // radius 18
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <svg width="48" height="48" style={{ position: 'absolute' }}>
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="rgba(251,191,36,0.15)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="#fbbf24"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <Flame size={20} color="#fbbf24" />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const patterns = useAppStore((s) => s.patterns);
  const sessions = useAppStore((s) => s.sessions);
  const profile = useAppStore((s) => s.profile);
  const setActivePattern = useAppStore((s) => s.setActivePattern);

  const topPatterns = useMemo(() => patterns.slice(0, 4), [patterns]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleSelectPattern = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setActivePattern(id);
    router.push('/session');
  };

  const handleQuickStart = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setActivePattern('box-4');
    router.push('/session');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Background ambient circle */}
      <BackgroundBreathingCircle />

      {/* Floating particles */}
      <FloatingParticle delay={0} x={50} y={120} />
      <FloatingParticle delay={5} x={280} y={180} />
      <FloatingParticle delay={10} x={180} y={150} />
      <FloatingParticle delay={7} x={320} y={200} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card — greeting + streak + CTA combined */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Greeting */}
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
          >
            {greeting}, {profile.name}
          </Text>

          {/* Streak inline with icon */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <StreakRing current={profile.currentStreak} longest={profile.longestStreak} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fbbf24', letterSpacing: -0.8 }}>
                {profile.currentStreak} day{profile.currentStreak !== 1 ? 's' : ''}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary }}>
                Current streak · Best: {profile.longestStreak}
              </Text>
            </View>
          </View>

          {/* Start Session Button */}
          <Pressable
            onPress={handleQuickStart}
            accessibilityLabel="Start breathing session"
            testID="start-session-btn"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              gap: 10,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Play size={18} color="#fff" fill="#fff" />
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' }}>
              Start Session
            </Text>
          </Pressable>
        </View>

        {/* Daily Focus Banner */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: 'rgba(99,102,241,0.15)',
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(99,102,241,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Sparkles size={20} color="#6366f1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#6366f1', marginBottom: 2 }}>
              Today's Focus
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary }}>
              Find calm in the breath
            </Text>
          </View>
        </View>

        {/* Patterns Grid (2x2 + See All) */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: colors.textPrimary,
              }}
            >
              Breathing Patterns
            </Text>
          </View>

          {/* 2x2 Grid */}
          <View style={{ gap: 10, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {topPatterns.slice(0, 2).map((p) => (
                <CompactPatternCard
                  key={p.id}
                  pattern={p}
                  onPress={() => handleSelectPattern(p.id)}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {topPatterns.slice(2, 4).map((p) => (
                <CompactPatternCard
                  key={p.id}
                  pattern={p}
                  onPress={() => handleSelectPattern(p.id)}
                />
              ))}
            </View>
          </View>

          {/* See All Row */}
          <Pressable
            onPress={() => router.push('/pattern-editor')}
            accessibilityLabel="View all patterns"
            testID="view-all-patterns"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 6,
            }}
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.primary }}>
              View All Patterns
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Recent Activity Summary */}
        <View>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Your Journey
          </Text>

          <View style={{ gap: 10 }}>
            {/* Total Sessions */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.bgCard,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
                Total Sessions
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.primary, letterSpacing: -0.5 }}>
                {profile.totalSessions}
              </Text>
            </View>

            {/* Total Minutes */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.bgCard,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
                Total Minutes
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.primary, letterSpacing: -0.5 }}>
                {profile.totalMinutes}
              </Text>
            </View>

            {/* View History CTA */}
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              accessibilityLabel="View session history"
              testID="view-history"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bgCard,
                borderRadius: 12,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 6,
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.primary }}>
                View Session History
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
