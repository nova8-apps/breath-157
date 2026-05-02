import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Star,
  Calendar,
  Heart,
  Square,
  Moon,
  Sun,
  Zap,
  CloudMoon,
  ChevronRight,
  StickyNote,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Session, BreathPattern } from '@/types';

const PATTERN_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  square: Square,
  moon: Moon,
  sun: Sun,
  zap: Zap,
  'cloud-moon': CloudMoon,
};

type TabKey = 'exercises' | 'history';

function SessionCard({ session }: { session: Session }) {
  const d = new Date(session.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const mins = Math.floor(session.duration / 60);
  const secs = session.duration % 60;

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary }}>
            {session.patternName}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            {dateStr}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              color={i < session.calmScore ? '#fbbf24' : 'rgba(255,255,255,0.1)'}
              fill={i < session.calmScore ? '#fbbf24' : 'transparent'}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
            {session.completedCycles}/{session.totalCycles} cycles
          </Text>
        </View>
      </View>

      {session.notes ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 6,
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <StickyNote size={13} color={colors.textMuted} style={{ marginTop: 2 }} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, flex: 1 }}>
            {session.notes}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PatternBrowseCard({ pattern, onSelect }: { pattern: BreathPattern; onSelect: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const IconComp = PATTERN_ICONS[pattern.icon] ?? Square;
  const cycleSec = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;
  const totalMin = Math.round((cycleSec * pattern.cycles) / 60);

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 14, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
      onPress={onSelect}
      accessibilityLabel={`Start ${pattern.name}`}
      testID={`browse-pattern-${pattern.id}`}
    >
      <Animated.View
        style={[
          animStyle,
          {
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: pattern.isPremium ? 'rgba(139,92,246,0.15)' : colors.primaryGlow,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <IconComp size={22} color={pattern.isPremium ? '#8b5cf6' : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.textPrimary }}>
            {pattern.name}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
            {pattern.description}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
            {totalMin} min · {pattern.inhale}-{pattern.hold}-{pattern.exhale}-{pattern.pause}s
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {pattern.isPremium && (
            <View
              style={{
                backgroundColor: 'rgba(139,92,246,0.2)',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginRight: 4,
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#8b5cf6' }}>PRO</Text>
            </View>
          )}
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('exercises');
  const sessions = useAppStore((s) => s.sessions);
  const patterns = useAppStore((s) => s.patterns);
  const setActivePattern = useAppStore((s) => s.setActivePattern);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  );

  const handleSelectPattern = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setActivePattern(id);
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
        {/* Large date card header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 24,
              color: colors.textPrimary,
              textAlign: 'center',
            }}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            {sessions.length} sessions completed
          </Text>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {(['exercises', 'history'] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityLabel={`${tab} tab`}
              testID={`tab-${tab}`}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: activeTab === tab ? colors.bgNested : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  fontSize: 14,
                  color: activeTab === tab ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {tab === 'exercises' ? 'Exercises' : 'History'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'exercises' ? (
          <>
            {patterns.map((p) => (
              <PatternBrowseCard
                key={p.id}
                pattern={p}
                onSelect={() => handleSelectPattern(p.id)}
              />
            ))}
            <Pressable
              onPress={() => router.push('/pattern-editor')}
              accessibilityLabel="Create custom pattern"
              testID="explore-create-custom"
              style={{
                backgroundColor: colors.primarySubtle,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(32,178,170,0.2)',
                borderStyle: 'dashed',
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.primary }}>
                + Create Custom Pattern
              </Text>
            </Pressable>
          </>
        ) : (
          sortedSessions.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Heart size={40} color={colors.textMuted} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 16,
                  color: colors.textSecondary,
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                No sessions yet
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: colors.textMuted,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Start your first breath
              </Text>
            </View>
          ) : (
            sortedSessions.map((s) => <SessionCard key={s.id} session={s} />)
          )
        )}
      </ScrollView>
    </View>
  );
}
