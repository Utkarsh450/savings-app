import { registerUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Validation", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email.trim().toLowerCase(), password.trim(), name.trim());
      setUser(user);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    Alert.alert("Google Sign-Up Removed", "This button is a placeholder for now. Please create an account with email and password.");
  };

  const busy = loading;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroPanel}>
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>Welcome to Finvase</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Secure</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Smart Spending,{"\n"}Bigger Savings!</Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Available Balance</Text>
            <Text style={styles.statsValue}>$13,123.00</Text>
            <View style={styles.statsBars}>
              {[48, 72, 34, 88, 62, 76].map((height, index) => (
                <View key={index} style={[styles.bar, { height }]} />
              ))}
            </View>
          </View>

          <View style={styles.quickActions}>
            {["Send", "Pay", "Request", "Transfer"].map((item) => (
              <View key={item} style={styles.quickPill}>
                <Text style={styles.quickPillText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create your account</Text>
          <Text style={styles.formSubtitle}>Start with your name, email, and password.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputShell}>
              <Ionicons name="person-outline" size={18} color={theme.muted} />
              <TextInput
                placeholder="John Carter"
                placeholderTextColor={theme.muted}
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={!busy}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputShell}>
              <Ionicons name="mail-outline" size={18} color={theme.muted} />
              <TextInput
                placeholder="mail@gmail.com"
                placeholderTextColor={theme.muted}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={!busy}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.muted} />
              <TextInput
                placeholder="Create password"
                placeholderTextColor={theme.muted}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!busy}
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryButton, busy && styles.buttonDisabled]} onPress={handleRegister} disabled={busy}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleRegister}
            disabled={false}
          >
            <>
              <Ionicons name="logo-google" size={16} color="#111111" />
              <Text style={styles.googleButtonText}>Google sign-up coming soon</Text>
            </>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")} disabled={busy}>
            <Text style={styles.bottomLink}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EEF2F2" },
    content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28, gap: 18 },
    heroPanel: {
      backgroundColor: "#117C7D",
      borderRadius: 36,
      padding: 20,
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    heroEyebrow: {
      color: "#D7F0F0",
      fontSize: 11,
      fontWeight: "700",
    },
    heroBadge: {
      backgroundColor: "#FFFFFF",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroBadgeText: {
      color: "#117C7D",
      fontSize: 11,
      fontWeight: "800",
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 30,
      lineHeight: 31,
      fontWeight: "800",
      letterSpacing: -0.7,
      maxWidth: 250,
    },
    statsCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      padding: 16,
      marginTop: 16,
      marginBottom: 14,
    },
    statsLabel: {
      color: "#687070",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 6,
    },
    statsValue: {
      color: "#111111",
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 12,
    },
    statsBars: {
      height: 92,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
    },
    bar: {
      flex: 1,
      borderRadius: 999,
      backgroundColor: theme.primary,
    },
    quickActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    quickPill: {
      backgroundColor: "#0D6D6E",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    quickPillText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },
    formCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "#E4E8E8",
      padding: 22,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 5,
    },
    formTitle: {
      color: "#111111",
      fontSize: 28,
      lineHeight: 30,
      fontWeight: "800",
      letterSpacing: -0.6,
    },
    formSubtitle: {
      color: "#6C7373",
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
      marginBottom: 18,
    },
    field: {
      marginBottom: 14,
    },
    label: {
      color: "#313838",
      fontWeight: "700",
      fontSize: 13,
      marginBottom: 8,
    },
    inputShell: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E5E9E9",
      backgroundColor: "#F8FAFA",
      borderRadius: 16,
      paddingHorizontal: 14,
      minHeight: 56,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      color: "#111111",
    },
    primaryButton: {
      backgroundColor: "#111111",
      minHeight: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 16,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: "#E7EBEB",
    },
    dividerText: {
      color: "#8A9191",
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    googleButton: {
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#DDE4E4",
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    googleButtonText: {
      color: "#111111",
      fontSize: 15,
      fontWeight: "800",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    bottomLink: {
      marginTop: 18,
      textAlign: "center",
      color: "#117C7D",
      fontWeight: "700",
      fontSize: 14,
    },
  });
