import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Clock, Repeat, ArrowRight, Play, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId = '' } = useLocalSearchParams<{ sessionId: string }>();
  const sessions = useAppStore((s) => s.sessions);

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  const ring1Scale = useSharedValue(0);
  const ring2Scale = useSharedValue(0);
  const ring3Scale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    // Staggered spring burst for rings
    ring1Scale.value = withDelay(0, withSpring(1, { damping: 12, stiffness: 100 }));
    ring2Scale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
    ring3Scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    statsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    btnOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, [ring1Scale, ring2Scale, ring3Scale, titleOpacity, statsOpacity, btnOpacity]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Scale.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Scale.value * 0.7,
  }));

  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Scale.value * 0.5,
  }));

  const titleAnim = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const statsAnim = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const btnAnim = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  const mins = session ? Math.floor(session.duration / 60) : 0;
  const secs = session ? session.duration % 60 : 0;

  // Dynamic headline based on duration
  let headline = 'Good start';
  let subline = 'Every breath counts';
  if (mins >= 6) {
    headline = 'Excellent session';
    subline = "You're building a powerful habit";
  } else if (mins >= 3) {
    headline = 'Well done';
    subline = 'Consistency is key';
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 32,
      }}
    >
      {/* Top bar with close button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingTop: 12,
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close"
          testID="session-complete-close"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Title with concentric ring burst */}
      <Animated.View style={[{ alignItems: 'center', marginBottom: 48 }, titleAnim]}>
        <View
          style={{
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {/* Ring 3 (outermost) */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.successGlow,
                borderWidth: 2,
                borderColor: colors.success,
              },
              ring3Style,
            ]}
          />
          {/* Ring 2 */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.successGlow,
                borderWidth: 2,
                borderColor: colors.success,
              },
              ring2Style,
            ]}
          />
          {/* Ring 1 (innermost) */}
          <Animated.View
            style={[
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.success,
                alignItems: 'center',
                justifyContent: 'center',
              },
              ring1Style,
            ]}
          >
            <Text style={{ fontSize: 24 }}>{'✨'}</Text>
          </Animated.View>
        </View>

        {/* Dynamic headline */}
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 28,
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {headline}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          {subline}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          {session?.patternName ?? 'Breathing exercise'}
        </Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[{ gap: 12, marginBottom: 48 }, statsAnim]}>
        {/* Duration */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.primaryGlow,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Clock size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
              Duration
            </Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.textPrimary, letterSpacing: -0.5 }}>
              {mins}:{secs.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Cycles */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(99,102,241,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Repeat size={22} color="#6366f1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
              Cycles
            </Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.textPrimary, letterSpacing: -0.5 }}>
              {session?.completedCycles ?? 0} / {session?.totalCycles ?? 0}
            </Text>
          </View>
        </View>

        {/* Calm Score */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.warningGlow,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Star size={22} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
              Calm Score
            </Text>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color={i < (session?.calmScore ?? 4) ? colors.warning : 'rgba(255,255,255,0.1)'}
                  fill={i < (session?.calmScore ?? 4) ? colors.warning : 'transparent'}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[{ marginTop: 'auto', gap: 12 }, btnAnim]}>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          accessibilityLabel="Done"
          testID="session-complete-done"
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#fff' }}>
            Done
          </Text>
          <ArrowRight size={20} color="#fff" />
        </Pressable>

        {/* Start another ghost button */}
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          accessibilityLabel="Start another session"
          testID="session-complete-start-another"
          style={{
            backgroundColor: 'transparent',
            borderRadius: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Play size={18} color={colors.primary} fill={colors.primary} />
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.primary }}>
            Start Another
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
