import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Volume2, VolumeX } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { BreathPhase, BreathPattern } from '@/types';

function getPhaseColor(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale': return colors.inhale;
    case 'hold': return colors.hold;
    case 'exhale': return colors.exhale;
    case 'pause': return colors.pause;
  }
}

function getPhaseLabel(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale': return 'Inhale';
    case 'hold': return 'Hold';
    case 'exhale': return 'Exhale';
    case 'pause': return 'Pause';
  }
}

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const activePatternId = useAppStore((s) => s.activePatternId);
  const patterns = useAppStore((s) => s.patterns);
  const addSession = useAppStore((s) => s.addSession);
  const profile = useAppStore((s) => s.profile);

  const pattern = useMemo<BreathPattern | undefined>(
    () => patterns.find((p) => p.id === activePatternId),
    [patterns, activePatternId]
  );

  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<BreathPhase>('inhale');
  const cycleRef = useRef(1);
  const phaseTimeRef = useRef(0);

  // Animation
  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0.4);
  const phaseProgress = useSharedValue(0); // 0 → 1 within each phase
  const phaseLabelOpacity = useSharedValue(1);
  const bgColorProgress = useSharedValue(0); // drives background color pulse

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const animatedGlow = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value * 1.4 }],
    opacity: circleOpacity.value * 0.25,
  }));

  const animatedBackground = useAnimatedStyle(() => {
    const phase = phaseRef.current;
    const phaseColor = getPhaseColor(phase);
    // Parse phaseColor hex to RGB
    const r = parseInt(phaseColor.slice(1, 3), 16);
    const g = parseInt(phaseColor.slice(3, 5), 16);
    const b = parseInt(phaseColor.slice(5, 7), 16);
    const alpha = bgColorProgress.value * 0.04; // max 4% opacity
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    };
  });

  const animatedPhaseLabelStyle = useAnimatedStyle(() => ({
    opacity: phaseLabelOpacity.value,
  }));

  const animatedProgressRingStyle = useAnimatedStyle(() => {
    const rotation = phaseProgress.value * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const triggerHaptic = useCallback(() => {
    if (profile.hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [profile.hapticsEnabled]);

  const animatePhase = useCallback((phase: BreathPhase, durationSec: number) => {
    'worklet';
    const ms = durationSec * 1000;
    const ease = Easing.inOut(Easing.ease);

    // Reset progress ring at start of each phase
    phaseProgress.value = 0;
    phaseProgress.value = withTiming(1, { duration: ms });

    // Crossfade phase label
    phaseLabelOpacity.value = 0;
    phaseLabelOpacity.value = withTiming(1, { duration: 300 });

    // Background color pulse
    bgColorProgress.value = 0;
    bgColorProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ms / 2, easing: ease }),
        withTiming(0, { duration: ms / 2, easing: ease })
      ),
      1,
      false
    );

    switch (phase) {
      case 'inhale':
        circleScale.value = withTiming(1, { duration: ms, easing: ease });
        circleOpacity.value = withTiming(0.9, { duration: ms, easing: ease });
        break;
      case 'hold':
        // Gentle pulse during hold
        circleScale.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: ms / 3, easing: ease }),
            withTiming(0.97, { duration: ms / 3, easing: ease }),
            withTiming(1, { duration: ms / 3, easing: ease })
          ),
          1,
          false
        );
        break;
      case 'exhale':
        circleScale.value = withTiming(0.5, { duration: ms, easing: ease });
        circleOpacity.value = withTiming(0.35, { duration: ms, easing: ease });
        break;
      case 'pause':
        circleScale.value = withTiming(0.5, { duration: 300 });
        circleOpacity.value = withTiming(0.3, { duration: 300 });
        break;
    }
  }, [circleScale, circleOpacity, phaseProgress, phaseLabelOpacity, bgColorProgress]);

  const getNextPhase = useCallback((currentP: BreathPhase, pat: BreathPattern): { phase: BreathPhase; duration: number; newCycle: boolean } => {
    switch (currentP) {
      case 'inhale':
        if (pat.hold > 0) return { phase: 'hold', duration: pat.hold, newCycle: false };
        return { phase: 'exhale', duration: pat.exhale, newCycle: false };
      case 'hold':
        return { phase: 'exhale', duration: pat.exhale, newCycle: false };
      case 'exhale':
        if (pat.pause > 0) return { phase: 'pause', duration: pat.pause, newCycle: false };
        return { phase: 'inhale', duration: pat.inhale, newCycle: true };
      case 'pause':
        return { phase: 'inhale', duration: pat.inhale, newCycle: true };
    }
  }, []);

  // Start session
  useEffect(() => {
    if (!pattern) return;

    phaseRef.current = 'inhale';
    phaseTimeRef.current = pattern.inhale;
    cycleRef.current = 1;

    setCurrentPhase('inhale');
    setPhaseTimeLeft(pattern.inhale);
    setCurrentCycle(1);
    setTotalSecondsElapsed(0);
    setIsRunning(true);
    setIsComplete(false);

    animatePhase('inhale', pattern.inhale);
    triggerHaptic();

    intervalRef.current = setInterval(() => {
      setTotalSecondsElapsed((prev) => prev + 1);

      phaseTimeRef.current -= 1;
      setPhaseTimeLeft(phaseTimeRef.current);

      if (phaseTimeRef.current <= 0) {
        const next = getNextPhase(phaseRef.current, pattern);

        if (next.newCycle) {
          const nextCycle = cycleRef.current + 1;
          if (nextCycle > pattern.cycles) {
            // Session complete
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsComplete(true);
            return;
          }
          cycleRef.current = nextCycle;
          setCurrentCycle(nextCycle);
        }

        phaseRef.current = next.phase;
        phaseTimeRef.current = next.duration;
        setCurrentPhase(next.phase);
        setPhaseTimeLeft(next.duration);
        animatePhase(next.phase, next.duration);
        triggerHaptic();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pattern, animatePhase, getNextPhase, triggerHaptic]);

  // Session complete
  useEffect(() => {
    if (isComplete && pattern) {
      const sessionId = `s-${Date.now()}`;
      addSession({
        id: sessionId,
        patternId: pattern.id,
        patternName: pattern.name,
        date: new Date().toISOString(),
        duration: totalSecondsElapsed,
        completedCycles: pattern.cycles,
        totalCycles: pattern.cycles,
        calmScore: 4,
        notes: '',
      });
      router.replace(`/session-complete?sessionId=${sessionId}`);
    }
  }, [isComplete, pattern, totalSecondsElapsed, addSession]);

  const doEndSession = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelAnimation(circleScale);
    cancelAnimation(circleOpacity);

    if (pattern && totalSecondsElapsed > 10) {
      const sessionId = `s-${Date.now()}`;
      addSession({
        id: sessionId,
        patternId: pattern.id,
        patternName: pattern.name,
        date: new Date().toISOString(),
        duration: totalSecondsElapsed,
        completedCycles: currentCycle - 1,
        totalCycles: pattern.cycles,
        calmScore: 3,
        notes: '',
      });
      router.replace(`/session-complete?sessionId=${sessionId}`);
    } else {
      router.back();
    }
  }, [pattern, totalSecondsElapsed, currentCycle, addSession, circleScale, circleOpacity]);

  const handleEnd = () => {
    const message = totalSecondsElapsed <= 10
      ? "You're less than 10 seconds in. Are you sure you want to stop?"
      : 'Are you sure you want to end this session?';

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        doEndSession();
      }
    } else {
      Alert.alert('End session?', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', style: 'destructive', onPress: doEndSession },
      ]);
    }
  };

  if (!pattern) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.textSecondary }}>
          No pattern selected
        </Text>
      </View>
    );
  }

  const totalMins = Math.floor(totalSecondsElapsed / 60);
  const totalSecs = totalSecondsElapsed % 60;
  const phaseColor = getPhaseColor(currentPhase);
  const CIRCLE_SIZE = 260;
  const sessionProgress = pattern.cycles > 0 ? ((currentCycle - 1) / pattern.cycles) : 0;

  return (
    <Animated.View style={[{ flex: 1 }, animatedBackground]}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={handleEnd}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="End session"
          testID="end-session-btn"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            gap: 6,
          }}
        >
          <X size={16} color={colors.textSecondary} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textSecondary }}>
            End
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setIsMuted(!isMuted)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={isMuted ? 'Unmute sound' : 'Mute sound'}
          testID="mute-toggle"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isMuted ? <VolumeX size={18} color={colors.textSecondary} /> : <Volume2 size={18} color={colors.textSecondary} />}
        </Pressable>
      </View>

      {/* Center content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Phase label with crossfade */}
        <Animated.View style={animatedPhaseLabelStyle}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: phaseColor,
              marginBottom: 32,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {getPhaseLabel(currentPhase)}
          </Text>
        </Animated.View>

        {/* Breathing Circle with radial progress ring */}
        <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {/* Radial progress arc ring */}
          <View
            style={{
              position: 'absolute',
              width: CIRCLE_SIZE + 16,
              height: CIRCLE_SIZE + 16,
              borderRadius: (CIRCLE_SIZE + 16) / 2,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: CIRCLE_SIZE + 16,
                  height: CIRCLE_SIZE + 16,
                  borderRadius: (CIRCLE_SIZE + 16) / 2,
                  borderWidth: 4,
                  borderColor: phaseColor,
                  borderTopColor: 'transparent',
                  borderLeftColor: 'transparent',
                },
                animatedProgressRingStyle,
              ]}
            />
          </View>

          {/* Outer glow */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                backgroundColor: phaseColor,
              },
              animatedGlow,
            ]}
          />
          {/* Main circle */}
          <Animated.View
            style={[
              {
                width: CIRCLE_SIZE * 0.75,
                height: CIRCLE_SIZE * 0.75,
                borderRadius: (CIRCLE_SIZE * 0.75) / 2,
                backgroundColor: phaseColor,
              },
              animatedCircle,
            ]}
          />
          {/* Center content */}
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Inter_800ExtraBold',
                fontSize: 48,
                color: '#fff',
                letterSpacing: -1,
              }}
            >
              {phaseTimeLeft}
            </Text>
          </View>
        </View>

        {/* Cycle pill + horizontal progress bar */}
        <View style={{ alignItems: 'center', marginTop: 32, width: 280 }}>
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: colors.primarySubtle,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              Cycle {currentCycle} of {pattern.cycles}
            </Text>
          </View>

          {/* Horizontal progress bar */}
          <View
            style={{
              width: '100%',
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 1.5,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: `${Math.min(sessionProgress * 100, 100)}%`,
                height: '100%',
                backgroundColor: colors.primary,
                borderRadius: 1.5,
              }}
            />
          </View>
        </View>

        {/* Timer + Pattern name */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 32,
              color: colors.textPrimary,
              letterSpacing: -1,
            }}
          >
            {totalMins.toString().padStart(2, '0')}:{totalSecs.toString().padStart(2, '0')}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 8,
            }}
          >
            {pattern.name}
          </Text>
        </View>
      </View>

      {/* Bottom spacer */}
      <View style={{ height: insets.bottom + 20 }} />
    </Animated.View>
  );
}
