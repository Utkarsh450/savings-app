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
  { id: "blueprint", label: "Blueprint", subtitle: "Balanced fintech blue" },
  { id: "graphite", label: "Graphite", subtitle: "Minimal neutral style" },
  { id: "mint", label: "Mint", subtitle: "Fresh green dashboard" },
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
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Savings Goal</Text>
            <Text style={styles.statValue}>72%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Streak</Text>
            <Text style={styles.statValue}>11 mo</Text>
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
                <View style={[styles.themePreview, item.id === "blueprint" ? styles.previewBlue : item.id === "graphite" ? styles.previewGray : styles.previewMint]} />
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
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: theme.primary }}
            />
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
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 62,
      paddingBottom: 110,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 20,
      letterSpacing: -0.3,
    },
    profileCard: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: "#121212",
      fontSize: 20,
      fontWeight: "700",
    },
    profileMeta: {
      marginLeft: 12,
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    email: {
      marginTop: 3,
      color: theme.muted,
      fontSize: 13,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
    },
    statLabel: {
      color: theme.muted,
      fontSize: 12,
      marginBottom: 4,
    },
    statValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    section: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 12,
    },
    themeHeading: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    themeGrid: {
      gap: 10,
      marginBottom: 4,
    },
    themeCard: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      backgroundColor: theme.surfaceAlt,
      padding: 11,
    },
    activeThemeCard: {
      borderColor: theme.primary,
      backgroundColor: theme.surface,
    },
    themePreview: {
      height: 10,
      borderRadius: 999,
      marginBottom: 8,
    },
    previewBlue: {
      backgroundColor: "#2E6EFF",
    },
    previewGray: {
      backgroundColor: "#444444",
    },
    previewMint: {
      backgroundColor: "#169C72",
    },
    themeLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    themeSubtitle: {
      color: theme.muted,
      marginTop: 2,
      fontSize: 12,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    settingIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceAlt,
    },
    settingLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
    },
    logoutButton: {
      marginTop: 18,
      backgroundColor: theme.danger,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    logoutText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
  });
