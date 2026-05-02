import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Flame,
  Heart,
  Volume2,
  Vibrate,
  Bell,
  HelpCircle,
  Shield,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { SOUND_LABELS } from '@/types';
import type { SoundPreference } from '@/types';

const SOUNDS: SoundPreference[] = ['none', 'forest', 'rain', 'ocean', 'bells'];

function StatPill({ icon: Icon, value, label }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  value: string;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.primaryGlow,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Icon size={18} color={colors.primary} />
      </View>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.textPrimary, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  icon: Icon,
  label,
  trailing,
  onPress,
  destructive,
  isLast,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={label}
      testID={`setting-${label.toLowerCase().replace(/\s/g, '-')}`}
      hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: destructive ? 'rgba(248,113,113,0.12)' : colors.primarySubtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={16} color={destructive ? colors.error : colors.primary} />
      </View>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          color: destructive ? colors.error : colors.textPrimary,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {trailing ?? (onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const setSoundPreference = useAppStore((s) => s.setSoundPreference);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);

  const [soundMenuOpen, setSoundMenuOpen] = React.useState(false);

  const handleSoundChange = (pref: SoundPreference) => {
    setSoundPreference(pref);
    setSoundMenuOpen(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
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
        {/* Avatar + Name */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primaryGlow,
              borderWidth: 2,
              borderColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 26, color: colors.primary }}>
              {profile.avatarInitials}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: colors.textPrimary }}>
            {profile.name}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            {profile.email}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
          <StatPill icon={Heart} value={String(profile.totalSessions)} label="Sessions" />
          <StatPill icon={Clock} value={String(profile.totalMinutes)} label="Minutes" />
          <StatPill icon={Flame} value={String(profile.longestStreak)} label="Best Streak" />
        </View>

        {/* Settings Section */}
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Settings
        </Text>

        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          <SettingRow
            icon={Bell}
            label="Notifications"
            trailing={
              <Switch
                value={profile.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primaryDark }}
                thumbColor={profile.notificationsEnabled ? colors.primary : '#666'}
                accessibilityLabel="Toggle notifications"
              />
            }
          />
          <SettingRow
            icon={Vibrate}
            label="Haptic Feedback"
            trailing={
              <Switch
                value={profile.hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primaryDark }}
                thumbColor={profile.hapticsEnabled ? colors.primary : '#666'}
                accessibilityLabel="Toggle haptic feedback"
              />
            }
          />
          <SettingRow
            icon={Volume2}
            label="Sound"
            onPress={() => setSoundMenuOpen(!soundMenuOpen)}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
                  {SOUND_LABELS[profile.soundPreference]}
                </Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            }
            isLast
          />
        </View>

        {/* Sound picker */}
        {soundMenuOpen ? (
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 20,
              marginTop: -12,
            }}
          >
            {SOUNDS.map((s) => (
              <Pressable
                key={s}
                onPress={() => handleSoundChange(s)}
                accessibilityLabel={`Set sound to ${SOUND_LABELS[s]}`}
                testID={`sound-${s}`}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: s !== 'bells' ? 1 : 0,
                  borderBottomColor: colors.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: profile.soundPreference === s ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    fontSize: 15,
                    color: profile.soundPreference === s ? colors.primary : colors.textPrimary,
                  }}
                >
                  {SOUND_LABELS[s]}
                </Text>
                {profile.soundPreference === s ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Quick Links */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            onPress={() => router.push('/privacy')}
          />
          <SettingRow
            icon={FileText}
            label="Terms of Service"
            onPress={() => router.push('/terms')}
          />
          <SettingRow
            icon={HelpCircle}
            label="Help & FAQ"
            onPress={() => router.push('/help')}
          />
          <SettingRow
            icon={LogOut}
            label="Sign Out"
            destructive
            onPress={() => {
              resetOnboarding();
              router.replace('/onboarding');
            }}
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
}
