import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Play, ChevronRight, Plus, Square, Moon, Sun, Zap, CloudMoon } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { BreathingCircle } from '@/components/BreathingCircle';
import { colors } from '@/lib/theme';
import type { BreathPattern } from '@/types';

const PATTERN_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  square: Square,
  moon: Moon,
  sun: Sun,
  zap: Zap,
  'cloud-moon': CloudMoon,
};

function PatternCard({ pattern, onPress }: { pattern: BreathPattern; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = PATTERN_ICONS[pattern.icon] ?? Square;
  const cycleSec = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;
  const totalMin = Math.round((cycleSec * pattern.cycles) / 60);

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 14, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
      onPress={onPress}
      accessibilityLabel={`Select ${pattern.name} pattern`}
      testID={`pattern-${pattern.id}`}
    >
      <Animated.View
        style={[
          animStyle,
          {
            width: 140,
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 16,
            marginRight: 12,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: pattern.isPremium ? 'rgba(139,92,246,0.15)' : colors.primaryGlow,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <IconComponent size={20} color={pattern.isPremium ? '#8b5cf6' : colors.primary} />
        </View>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {pattern.name}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          {totalMin} min · {pattern.cycles} cycles
        </Text>
        {pattern.isPremium && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(139,92,246,0.2)',
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#8b5cf6' }}>PRO</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function SessionRow({ patternName, duration, time, isLast }: { patternName: string; duration: number; time: string; isLast?: boolean }) {
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
          {patternName}
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
          {time}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.textSecondary }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const patterns = useAppStore((s) => s.patterns);
  const sessions = useAppStore((s) => s.sessions);
  const profile = useAppStore((s) => s.profile);
  const setActivePattern = useAppStore((s) => s.setActivePattern);

  const recentSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

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
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: colors.textSecondary,
            }}
          >
            {greeting}, {profile.name}
          </Text>
        </View>

        {/* Hero Breathing Circle */}
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <BreathingCircle size={220} isActive={false} />
        </View>

        {/* Start Session Button */}
        <View style={{ marginBottom: 32 }}>
          <Pressable
            onPress={handleQuickStart}
            accessibilityLabel="Start breathing session"
            testID="start-session-btn"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 18,
              gap: 10,
            }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Play size={20} color="#fff" fill="#fff" />
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#fff' }}>
              Start Session
            </Text>
          </Pressable>
        </View>

        {/* Streak Badge */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(251,191,36,0.08)',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(251,191,36,0.15)',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: 'rgba(251,191,36,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Flame size={24} color="#fbbf24" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fbbf24', letterSpacing: -0.5 }}>
                {profile.currentStreak} days
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
                Current streak · Best: {profile.longestStreak}
              </Text>
            </View>
          </View>
        </View>

        {/* Patterns Carousel */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
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
            <Pressable
              onPress={() => router.push('/pattern-editor')}
              accessibilityLabel="Create custom pattern"
              testID="create-pattern-btn"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.primary }}>
                Custom
              </Text>
            </Pressable>
          </View>
          <View style={{ height: 170, marginHorizontal: -24 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {patterns.map((p) => (
                <PatternCard
                  key={p.id}
                  pattern={p}
                  onPress={() => handleSelectPattern(p.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Recent Sessions */}
        <View>
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
              Recent Sessions
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              accessibilityLabel="View all sessions"
              testID="view-all-sessions"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.primary }}>
                View All
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
            }}
          >
            {recentSessions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Begin your first breathing session
                </Text>
              </View>
            ) : (
              recentSessions.map((s, index) => {
                const d = new Date(s.date);
                const timeStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <SessionRow
                    key={s.id}
                    patternName={s.patternName}
                    duration={s.duration}
                    time={timeStr}
                    isLast={index === recentSessions.length - 1}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
