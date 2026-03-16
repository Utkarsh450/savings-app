import { logoutUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { useThemeStore } from "@/src/features/theme/themeStore";
import { AppTheme, ThemeVariant } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const themeOptions: { id: ThemeVariant; label: string; subtitle: string }[] = [
  { id: "blueprint", label: "Lime Noir", subtitle: "Bold black with neon accent" },
  { id: "graphite", label: "Soft Ivory", subtitle: "Editorial light finance style" },
  { id: "mint", label: "Market Moss", subtitle: "Dark green trading mood" },
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setMode = useThemeStore((state) => state.setMode);
  const setVariant = useThemeStore((state) => state.setVariant);
  const { theme, isDark, variant } = useAppTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const fullName = user?.name || "User";
  const email = user?.email || "Not available";
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleDarkModeToggle = (value: boolean) => {
    setMode(value ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Logout Failed", message);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Profile</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Savings Goal</Text>
              <Text style={styles.heroStatValue}>72%</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Monthly Streak</Text>
              <Text style={styles.heroStatValue}>11 mo</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="moon-outline" size={16} color={theme.text} />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={handleDarkModeToggle} trackColor={{ true: theme.primary }} />
          </View>

          <Text style={styles.themeHeading}>Theme</Text>
          <View style={styles.themeGrid}>
            {themeOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.themeCard, variant === item.id && styles.activeThemeCard]}
                onPress={() => setVariant(item.id)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.themePreview,
                    item.id === "blueprint" ? styles.previewBlue : item.id === "graphite" ? styles.previewGray : styles.previewMint,
                  ]}
                />
                <Text style={styles.themeLabel}>{item.label}</Text>
                <Text style={styles.themeSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="notifications-outline" size={16} color={theme.text} />
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: theme.primary }} />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="finger-print-outline" size={16} color={theme.text} />
              </View>
              <Text style={styles.settingLabel}>Biometric Lock</Text>
            </View>
            <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} trackColor={{ true: theme.primary }} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#111111" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 110, gap: 14 },
    heroCard: { backgroundColor: "#090909", borderRadius: 34, borderWidth: 1, borderColor: "#1F1F1F", padding: 18 },
    eyebrow: { color: "#A39D91", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 12 },
    profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#111111", fontSize: 22, fontWeight: "800" },
    profileMeta: { marginLeft: 14, flex: 1 },
    name: { fontSize: 20, fontWeight: "800", color: "#F7F4EC" },
    email: { marginTop: 4, color: "#A39D91", fontSize: 13 },
    statsRow: { flexDirection: "row", gap: 10 },
    heroStat: { flex: 1, backgroundColor: "#171717", borderWidth: 1, borderColor: "#262626", borderRadius: 24, padding: 14 },
    heroStatLabel: { color: "#A39D91", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: "700" },
    heroStatValue: { color: "#F7F4EC", fontSize: 24, fontWeight: "800", letterSpacing: -0.4 },
    section: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 28, padding: 16 },
    sectionTitle: { color: theme.text, fontSize: 18, fontWeight: "800", marginBottom: 12 },
    themeHeading: { color: theme.muted, fontSize: 12, fontWeight: "700", marginBottom: 8, marginTop: 6, textTransform: "uppercase", letterSpacing: 0.4 },
    themeGrid: { gap: 10 },
    themeCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 18, backgroundColor: theme.surfaceAlt, padding: 12 },
    activeThemeCard: { borderColor: theme.primary, backgroundColor: theme.surface },
    themePreview: { height: 12, borderRadius: 999, marginBottom: 10 },
    previewBlue: { backgroundColor: "#D6FF39" },
    previewGray: { backgroundColor: "#111111" },
    previewMint: { backgroundColor: "#B9FF54" },
    themeLabel: { color: theme.text, fontSize: 15, fontWeight: "800" },
    themeSubtitle: { color: theme.muted, marginTop: 3, fontSize: 12 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    settingIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: theme.surfaceAlt },
    settingLabel: { color: theme.text, fontSize: 14, fontWeight: "700" },
    logoutButton: { marginTop: 4, backgroundColor: theme.primary, borderRadius: 22, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
    logoutText: { color: "#111111", fontWeight: "800", fontSize: 15 },
  });
