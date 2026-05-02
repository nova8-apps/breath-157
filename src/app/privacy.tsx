import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors } from '@/lib/theme';

export default function PrivacyPolicyScreen() {
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
          Privacy Policy
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close"
          testID="privacy-close"
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
          1. Information We Collect
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          Breath collects and stores your breathing session data, patterns, preferences, and usage statistics locally on your device. We do not transmit your personal data to external servers unless you explicitly opt in to cloud sync features.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          2. How We Use Your Information
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          Your session data is used solely to provide and improve your breathing exercise experience. We use this information to calculate streaks, generate insights, and personalize your experience within the app. Your data remains private and under your control.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          3. Data Sharing and Third Parties
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We do not sell, rent, or share your personal information with third parties for marketing purposes. Anonymous usage analytics may be collected to improve app performance and features, but these analytics contain no personally identifiable information.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          4. Data Retention and Deletion
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          Your data is stored locally on your device and persists until you delete the app or manually clear your session history. You can delete your account and all associated data at any time through the Profile screen. This action is irreversible.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          5. Security
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We employ industry-standard security measures to protect your data. All data stored locally is protected by your device's built-in security mechanisms. If you enable cloud sync, your data is transmitted over encrypted connections and stored securely.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          6. Children's Privacy
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          Breath is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          7. Changes to This Policy
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy within the app. Your continued use of Breath after changes are posted constitutes acceptance of the updated policy.
        </Text>

        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 20, marginBottom: 8 }}>
          8. Contact Us
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
          If you have questions about this Privacy Policy or our data practices, please contact us at support@apexailabs.dev.
        </Text>
      </ScrollView>
    </View>
  );
}
