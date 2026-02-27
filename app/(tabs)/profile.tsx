import { logoutUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { useThemeStore } from "@/src/features/theme/themeStore";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setMode = useThemeStore((state) => state.setMode);
  const { theme, isDark } = useAppTheme();

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
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="moon-outline" size={16} color={theme.text} />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={handleDarkModeToggle} trackColor={{ true: theme.primary }} />
          </View>

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
      paddingBottom: 30,
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
      borderRadius: 20,
      padding: 16,
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
      borderRadius: 20,
      padding: 14,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
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
