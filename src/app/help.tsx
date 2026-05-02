import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    question: 'What is box breathing?',
    answer: 'Box breathing is a technique where you inhale, hold, exhale, and hold again for equal durations (typically 4 seconds each). It\'s used by Navy SEALs and first responders to manage stress and improve focus. The equal rhythm calms your nervous system.',
  },
  {
    id: '2',
    question: 'What is the 4-7-8 technique?',
    answer: 'Developed by Dr. Andrew Weil, the 4-7-8 technique involves inhaling for 4 seconds, holding for 7 seconds, and exhaling for 8 seconds. The extended exhale activates your parasympathetic nervous system, making it excellent for falling asleep or reducing anxiety.',
  },
  {
    id: '3',
    question: 'Can I customize my own patterns?',
    answer: 'Yes! Tap the "+" icon on the Home screen or go to Explore > All Patterns > Create Custom Pattern. You can set custom inhale, hold, exhale, and pause durations, choose the number of cycles, and name your pattern for easy access later.',
  },
  {
    id: '4',
    question: 'How do sessions get tracked?',
    answer: 'Every completed session is automatically logged with the date, pattern used, duration, cycles completed, and a calm score. View your full history on the Explore tab under "History". Your streak counter on the Home screen tracks consecutive days of practice.',
  },
  {
    id: '5',
    question: 'What do the haptic vibrations mean?',
    answer: 'Gentle haptic taps mark each breath phase transition — when you should switch from inhaling to holding, holding to exhaling, etc. This lets you close your eyes during sessions and still follow the rhythm. You can disable haptics in Profile > Settings.',
  },
  {
    id: '6',
    question: 'How long should I practice?',
    answer: 'Even 2-3 minutes of focused breathing makes a measurable difference. Most patterns are designed for 4-8 minutes. We recommend starting with the 6-Minute Calm pattern and gradually exploring longer sessions as you build your practice.',
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const height = useSharedValue(0);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    height.value = withTiming(next ? 1 : 0, { duration: 240 });
  };

  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: height.value * 400,
    opacity: height.value,
    overflow: 'hidden' as const,
  }));

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={toggleOpen}
        accessibilityLabel={item.question}
        testID={`faq-${item.id}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 15,
            color: colors.textPrimary,
            flex: 1,
            paddingRight: 8,
          }}
        >
          {item.question}
        </Text>
        {isOpen ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </Pressable>
      <Animated.View style={contentStyle}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 22,
              color: colors.textSecondary,
            }}
          >
            {item.answer}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
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
            marginBottom: 28,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close help"
            testID="help-close"
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
            Help & FAQ
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.primaryGlow,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <MessageCircle size={28} color={colors.primary} />
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Common questions about breathing exercises and using the app.
          </Text>
        </View>

        {/* FAQ List */}
        {FAQ_ITEMS.map((item) => (
          <FaqAccordion key={item.id} item={item} />
        ))}

        {/* Contact */}
        <View
          style={{
            backgroundColor: colors.primarySubtle,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            marginTop: 12,
            borderWidth: 1,
            borderColor: 'rgba(32,178,170,0.15)',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Still have questions?
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Reach out to us and we will get back to you within 24 hours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
