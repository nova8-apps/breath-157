import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { X, Check, Wind } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BreathingCircle } from '@/components/BreathingCircle';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { BreathPattern } from '@/types';

function DurationSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
          {label}
        </Text>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 17, color: colors.primary }}>
          {value}s
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={1}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor="rgba(255,255,255,0.1)"
        thumbTintColor={colors.primary}
        style={{ height: 40 }}
        accessibilityLabel={`${label} duration slider`}
      />
    </View>
  );
}

export default function PatternEditorScreen() {
  const insets = useSafeAreaInsets();
  const addPattern = useAppStore((s) => s.addPattern);

  const [name, setName] = useState('');
  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(2);
  const [exhale, setExhale] = useState(4);
  const [pause, setPause] = useState(0);
  const [cycles, setCycles] = useState(6);

  const cycleSec = inhale + hold + exhale + pause;
  const totalMin = useMemo(() => Math.round((cycleSec * cycles) / 60), [cycleSec, cycles]);

  const handleSave = () => {
    const patternName = name.trim() || `Custom ${inhale}-${hold}-${exhale}`;
    const newPattern: BreathPattern = {
      id: `custom-${Date.now()}`,
      name: patternName,
      description: `Custom pattern: ${inhale}s inhale, ${hold}s hold, ${exhale}s exhale${pause > 0 ? `, ${pause}s pause` : ''}.`,
      inhale,
      hold,
      exhale,
      pause,
      cycles,
      icon: 'square',
      isPremium: false,
      isFavorite: false,
    };
    addPattern(newPattern);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    router.back();
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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cancel"
            testID="pattern-editor-cancel"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.textPrimary }}>
            Create Pattern
          </Text>
          <Pressable
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Save pattern"
            testID="pattern-editor-save"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Preview circle */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <BreathingCircle
            size={160}
            isActive
            inhale={inhale}
            hold={hold}
            exhale={exhale}
            pause={pause}
          />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: colors.textSecondary,
              marginTop: 12,
            }}
          >
            ~{totalMin} min · {cycles} cycles
          </Text>
        </View>

        {/* Pattern Name */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 15,
              color: colors.textPrimary,
              marginBottom: 8,
            }}
          >
            Pattern Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Evening Wind Down"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Pattern name input"
            testID="pattern-name-input"
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>

        {/* Sliders */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <DurationSlider label="Inhale" value={inhale} min={1} max={10} onChange={setInhale} />
          <DurationSlider label="Hold" value={hold} min={0} max={10} onChange={setHold} />
          <DurationSlider label="Exhale" value={exhale} min={1} max={10} onChange={setExhale} />
          <DurationSlider label="Pause" value={pause} min={0} max={5} onChange={setPause} />
          <DurationSlider label="Cycles" value={cycles} min={1} max={20} onChange={setCycles} />
        </View>
      </ScrollView>

      {/* Bottom save button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleSave}
          accessibilityLabel="Save custom pattern"
          testID="save-pattern-bottom"
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
          <Wind size={20} color="#fff" />
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#fff' }}>
            Save Pattern
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
