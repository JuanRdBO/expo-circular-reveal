import { triggerTransition } from "expo-circular-reveal";
import { StatusBar } from "expo-status-bar";
import React, { startTransition, useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ThemeMode = "light" | "dark";

type Theme = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  secondaryText: string;
  muted: string;
  accent: string;
  accentSoft: string;
  pill: string;
  shadow: string;
};

type SummaryItem = {
  label: string;
  value: string;
};

type TaskItem = {
  title: string;
  meta: string;
  accent: string;
};

const DURATION_MS = 680;

const THEMES: Record<ThemeMode, Theme> = {
  light: {
    background: "#F6F0E6",
    surface: "#FFF9F1",
    surfaceMuted: "#F2E6D7",
    border: "rgba(82, 57, 38, 0.12)",
    text: "#1F140C",
    secondaryText: "#6A5444",
    muted: "#8A7261",
    accent: "#C65A2D",
    accentSoft: "rgba(198, 90, 45, 0.12)",
    pill: "#F8E6D7",
    shadow: "rgba(73, 44, 20, 0.12)",
  },
  dark: {
    background: "#081B24",
    surface: "#112833",
    surfaceMuted: "#163440",
    border: "rgba(153, 211, 224, 0.12)",
    text: "#EAF5F8",
    secondaryText: "#A7C9D3",
    muted: "#7EA6B0",
    accent: "#63D8CD",
    accentSoft: "rgba(99, 216, 205, 0.14)",
    pill: "#0E2430",
    shadow: "rgba(0, 0, 0, 0.28)",
  },
};

const SUMMARY_ITEMS: SummaryItem[] = [
  { label: "Projects", value: "04" },
  { label: "Tasks", value: "12" },
  { label: "Done", value: "08" },
];

const TASKS: TaskItem[] = [
  {
    title: "Refine the light and dark color palettes",
    meta: "Design system · Today",
    accent: "#C65A2D",
  },
  {
    title: "Wire the native circular reveal into the settings flow",
    meta: "Mobile app · In review",
    accent: "#4D8DFF",
  },
  {
    title: "Prepare release notes for the example app",
    meta: "Docs · Tomorrow",
    accent: "#3FAE7A",
  },
];

export default function App() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = THEMES[mode];
  const nextMode = mode === "light" ? "dark" : "light";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function releaseInteractionLock() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      timeoutRef.current = null;
    }, DURATION_MS + 120);
  }

  async function handleThemePress(event: GestureResponderEvent) {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    const { pageX, pageY } = event.nativeEvent;

    try {
      await triggerTransition(pageX, pageY, DURATION_MS);
    } catch {
      // If the native module is unavailable, keep the same theme swap behavior.
    } finally {
      startTransition(() => {
        setMode(nextMode);
      });
      releaseInteractionLock();
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={[
            styles.glow,
            styles.glowTop,
            { backgroundColor: theme.accentSoft },
          ]}
        />
        <View
          style={[
            styles.glow,
            styles.glowBottom,
            { backgroundColor: theme.accentSoft },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: theme.muted }]}>
          Mock workspace
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          Theme transition example
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          A simple screen with stable layout, mock data, and one floating action
          to trigger the circular reveal.
        </Text>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.cardKicker, { color: theme.muted }]}>
                Today
              </Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>
                Product team board
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                { backgroundColor: theme.pill, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.pillText, { color: theme.secondaryText }]}>
                Mock data
              </Text>
            </View>
          </View>

          <Text style={[styles.heroBody, { color: theme.secondaryText }]}>
            Keep the content identical in both themes and only swap colors. That
            keeps the screen visually steady while the native reveal expands.
          </Text>

          <View style={styles.summaryRow}>
            {SUMMARY_ITEMS.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.surfaceMuted,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {item.value}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.listCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Upcoming
          </Text>

          <View style={styles.taskList}>
            {TASKS.map((task) => (
              <View
                key={task.title}
                style={[
                  styles.taskRow,
                  {
                    backgroundColor: theme.surfaceMuted,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[styles.taskAccent, { backgroundColor: task.accent }]}
                />
                <View style={styles.taskCopy}>
                  <Text style={[styles.taskTitle, { color: theme.text }]}>
                    {task.title}
                  </Text>
                  <Text style={[styles.taskMeta, { color: theme.secondaryText }]}>
                    {task.meta}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        disabled={isTransitioning}
        onPress={handleThemePress}
        style={({ pressed }) => [
          styles.floatingButton,
          {
            backgroundColor: theme.accent,
            shadowColor: theme.shadow,
            opacity: pressed || isTransitioning ? 0.86 : 1,
          },
        ]}
      >
        <Text style={styles.floatingButtonLabel}>Theme</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  glowTop: {
    width: 220,
    height: 220,
    top: -50,
    right: -40,
  },
  glowBottom: {
    width: 260,
    height: 260,
    bottom: 10,
    left: -90,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.9,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  heroCard: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 7,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardKicker: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroBody: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    minHeight: 92,
    justifyContent: "space-between",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  taskList: {
    gap: 12,
    marginTop: 16,
  },
  taskRow: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  taskAccent: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  taskCopy: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  taskMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 92,
    height: 92,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
  },
  floatingButtonLabel: {
    color: "#041A24",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
