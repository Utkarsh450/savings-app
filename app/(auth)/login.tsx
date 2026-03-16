import { loginUser } from "@/src/features/auth/authService";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email.trim().toLowerCase(), password.trim());
      setUser(user);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Sign-In Removed", "This button is a placeholder for now. Please use email and password to log in.");
  };

  const busy = loading;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroPanel}>
          <View style={styles.mockPhone}>
            <View style={styles.phoneNotch} />
            <View style={styles.phoneInner}>
              <Text style={styles.mockHeader}>Welcome to Finvase</Text>
              <Text style={styles.mockTitle}>Take Control of Your{"\n"}Financial Future</Text>

              <View style={styles.mockCardWrap}>
                <View style={styles.mockCard}>
                  <Text style={styles.mockAmount}>$82,758.10</Text>
                  <View style={styles.mockStatRow}>
                    <View style={styles.mockStatPill}>
                      <Text style={styles.mockStatText}>Expenses</Text>
                    </View>
                    <View style={styles.mockStatPill}>
                      <Text style={styles.mockStatText}>Savings</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.mockButton}>
                <Text style={styles.mockButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Smart Spending</Text>
            <Text style={styles.heroTitle}>Simple banking{"\n"}entry flow.</Text>
            <Text style={styles.heroSubtitle}>Clean cards, soft finance spacing, and the same features underneath.</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in to your account</Text>
          <Text style={styles.formSubtitle}>Enter your email and password to log in.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputShell}>
              <Ionicons name="mail-outline" size={18} color={theme.muted} />
              <TextInput
                placeholder="mail@gmail.com"
                placeholderTextColor={theme.muted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!busy}
              />
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.linkInline}>Forgot Password?</Text>
            </View>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.muted} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={theme.muted}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!busy}
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryButton, busy && styles.buttonDisabled]} onPress={handleLogin} disabled={busy}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={false}
          >
            <>
              <Ionicons name="logo-google" size={16} color="#111111" />
              <Text style={styles.googleButtonText}>Google sign-in coming soon</Text>
            </>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")} disabled={busy}>
            <Text style={styles.bottomLink}>Don&apos;t have an account? Sign up</Text>
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
      backgroundColor: "#D8E1E1",
      borderRadius: 36,
      padding: 18,
      gap: 18,
    },
    mockPhone: {
      alignSelf: "center",
      width: 250,
      backgroundColor: "#F9FAFA",
      borderRadius: 30,
      borderWidth: 6,
      borderColor: "#117C7D",
      overflow: "hidden",
      paddingTop: 6,
    },
    phoneNotch: {
      width: 58,
      height: 14,
      borderRadius: 999,
      backgroundColor: "#0F1111",
      alignSelf: "center",
      marginBottom: 6,
    },
    phoneInner: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: "#117C7D",
      minHeight: 320,
    },
    mockHeader: {
      color: "#CFF2F1",
      fontSize: 11,
      marginTop: 10,
      marginBottom: 10,
      fontWeight: "700",
    },
    mockTitle: {
      color: "#FFFFFF",
      fontSize: 27,
      lineHeight: 29,
      fontWeight: "800",
      maxWidth: 190,
    },
    mockCardWrap: {
      alignItems: "center",
      marginTop: 12,
      marginBottom: 14,
    },
    mockCard: {
      width: 158,
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 12,
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 12,
      elevation: 5,
    },
    mockAmount: {
      color: "#111111",
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 8,
    },
    mockStatRow: {
      flexDirection: "row",
      gap: 8,
    },
    mockStatPill: {
      backgroundColor: "#F1F3F3",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    mockStatText: {
      color: "#6D7474",
      fontSize: 10,
      fontWeight: "700",
    },
    mockButton: {
      marginTop: "auto",
      backgroundColor: "#0F1111",
      borderRadius: 12,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    mockButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    heroCopy: {
      paddingHorizontal: 4,
      gap: 6,
    },
    heroEyebrow: {
      color: "#117C7D",
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    heroTitle: {
      color: "#111111",
      fontSize: 30,
      lineHeight: 31,
      fontWeight: "800",
      letterSpacing: -0.7,
    },
    heroSubtitle: {
      color: "#5E6666",
      fontSize: 14,
      lineHeight: 20,
      maxWidth: 280,
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
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    label: {
      color: "#313838",
      fontWeight: "700",
      fontSize: 13,
    },
    linkInline: {
      color: "#117C7D",
      fontSize: 12,
      fontWeight: "700",
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
      color: "#111111",
      marginLeft: 10,
      fontSize: 15,
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
