import { triggerTransition } from "expo-circular-reveal";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const lightTheme = {
  background: "#f5f5f5",
  card: "#ffffff",
  text: "#1a1a1a",
  secondaryText: "#666666",
  accent: "#4a90d9",
  border: "#e0e0e0",
};

const darkTheme = {
  background: "#1a1a1a",
  card: "#2a2a2a",
  text: "#f5f5f5",
  secondaryText: "#999999",
  accent: "#6bb5ff",
  border: "#3a3a3a",
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  const handleToggle = useCallback(
    async (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;
      try {
        await triggerTransition(pageX, pageY, 400);
        setIsDark((prev) => !prev);
      } catch {
        // Fallback: just toggle without animation
        setIsDark((prev) => !prev);
      }
    },
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Text style={[styles.title, { color: theme.text }]}>
        Circular Reveal Demo
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Tap the button to toggle the theme
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Sample Card
        </Text>
        <Text style={[styles.cardBody, { color: theme.secondaryText }]}>
          This card demonstrates how the circular reveal transition animates
          between light and dark themes, just like Telegram.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          How it works
        </Text>
        <Text style={[styles.cardBody, { color: theme.secondaryText }]}>
          The native module captures a screenshot, overlays it, then animates a
          circular hole expanding from the tap point to reveal the new theme
          underneath.
        </Text>
      </View>

      <Pressable
        onPress={handleToggle}
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.buttonText}>
          Switch to {isDark ? "Light" : "Dark"} Theme
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
