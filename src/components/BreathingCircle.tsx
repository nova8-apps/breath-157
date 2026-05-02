import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';

interface BreathingCircleProps {
  size?: number;
  isActive?: boolean;
  inhale?: number;
  hold?: number;
  exhale?: number;
  pause?: number;
  color?: string;
}

export function BreathingCircle({
  size = 200,
  isActive = true,
  inhale = 4,
  hold = 0,
  exhale = 4,
  pause = 0,
  color = colors.primary,
}: BreathingCircleProps) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (!isActive) {
      // Idle gentle pulse
      scale.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      return;
    }

    const inMs = inhale * 1000;
    const holdMs = hold * 1000;
    const exMs = exhale * 1000;
    const pauseMs = pause * 1000;

    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: inMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: holdMs }),
        withTiming(0.5, { duration: exMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: pauseMs })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: inMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: holdMs }),
        withTiming(0.35, { duration: exMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: pauseMs })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [isActive, inhale, hold, exhale, pause, scale, opacity]);

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedGlow = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.3 }],
    opacity: opacity.value * 0.3,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedGlow,
        ]}
      />
      {/* Inner circle */}
      <Animated.View
        style={[
          {
            width: size * 0.75,
            height: size * 0.75,
            borderRadius: (size * 0.75) / 2,
            backgroundColor: color,
          },
          animatedCircle,
        ]}
      />
      {/* Center bright dot */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.15,
          height: size * 0.15,
          borderRadius: (size * 0.15) / 2,
          backgroundColor: 'rgba(255,255,255,0.3)',
        }}
      />
    </View>
  );
}
