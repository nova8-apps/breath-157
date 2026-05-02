import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors } from '@/lib/theme';

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          Terms of Service
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close"
          testID="terms-close"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginBottom: 12 }}>
          Last updated: May 2, 2026
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          1. Acceptance of Terms
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          By downloading, installing, or using the Breath app ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          2. License and Permitted Use
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We grant you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes. You may not reverse engineer, decompile, or attempt to extract the source code of the App, except where such restriction is prohibited by law.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          3. User Responsibilities
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          You are responsible for maintaining the security of your account credentials (if applicable) and for all activities that occur under your account. You agree to use the App in compliance with all applicable laws and regulations. The App is intended for wellness purposes and is not a substitute for professional medical advice or treatment.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          4. Medical Disclaimer
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          Breath provides breathing exercises for relaxation and wellness. It is not intended to diagnose, treat, cure, or prevent any medical condition. Always consult a qualified healthcare provider before beginning any new wellness practice, especially if you have pre-existing health conditions.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          5. Intellectual Property
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          All content, design, graphics, user interface, and other materials in the App are owned by Apex AI Labs (LLC) or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any App content without express written permission.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          6. Disclaimers and Limitation of Liability
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          The App is provided "as is" without warranties of any kind, either express or implied. To the fullest extent permitted by law, Apex AI Labs (LLC) disclaims all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We are not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the App.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          7. Termination
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We reserve the right to suspend or terminate your access to the App at any time, with or without notice, for any reason, including violation of these Terms. You may stop using the App at any time by deleting it from your device.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          8. Governing Law
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Apex AI Labs (LLC) operates, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the App shall be resolved in the courts of that jurisdiction.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          9. Changes to These Terms
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms within the App. Your continued use after changes are posted constitutes acceptance of the revised Terms.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          10. Contact Us
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          If you have questions about these Terms, please contact us at support@apexailabs.dev.
        </Text>
      </ScrollView>
    </View>
  );
}
