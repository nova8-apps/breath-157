// @nova8/auto-legal v1 — auto-generated Support screen.
//
// This file is owned by Nova8 and gets re-rendered whenever the user
// saves the Privacy Info form in the dashboard. Edit the marker line
// above to "user-owned" to opt out of auto-sync.
//
// Generated at: 2026-05-02
// Source of truth: src/lib/legal-config.ts

import { ScrollView, View, Text, Linking, Pressable } from "react-native";
import { LEGAL_CONFIG } from "@/lib/legal-config";

export default function SupportScreen() {
  const c = LEGAL_CONFIG;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 4 }}>
        Support
      </Text>
      <Text style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
        {c.displayName}
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Need help? Run into a bug? Have a feature request? We read every
        message and reply within a few business days.
      </Text>

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL("mailto:" + c.contactEmail + "?subject=" + encodeURIComponent(c.displayName + " support"))}
        style={{
          backgroundColor: "#0a66ff",
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Email {c.contactEmail}
        </Text>
      </Pressable>

      {c.website ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(c.website)}
          style={{ paddingVertical: 12, marginBottom: 8 }}
        >
          <Text style={{ color: "#0a66ff" }}>Visit our website →</Text>
        </Pressable>
      ) : null}

      <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 16 }} />

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
        Legal
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(c.hostedPolicyUrl)}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: "#0a66ff" }}>Privacy Policy</Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(c.appleStandardEulaUrl)}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: "#0a66ff" }}>Terms of Use</Text>
      </Pressable>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
