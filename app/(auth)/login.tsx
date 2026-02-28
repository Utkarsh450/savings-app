import { loginUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { AppTheme } from "@/src/theme/appTheme";
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
      const cleanedEmail = email.trim().toLowerCase();
      const cleanedPassword = password.trim();

      const user = await loginUser(cleanedEmail, cleanedPassword);
      setUser(user);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={18}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Savings App</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your money clearly.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputShell}>
            <Ionicons name="mail-outline" size={18} color={theme.muted} />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={theme.muted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputShell}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.muted} />
            <TextInput
              placeholder="Enter password"
              placeholderTextColor={theme.muted}
              secureTextEntry
              keyboardType="default"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")} disabled={loading}>
          <Text style={styles.link}>No account yet? Create one</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 28,
    },
    hero: {
      marginBottom: 18,
      paddingHorizontal: 4,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.text,
      marginTop: 8,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.muted,
      marginTop: 8,
      lineHeight: 20,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 22,
      padding: 18,
      shadowColor: "#102A43",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 2,
    },
    label: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 13,
      marginBottom: 8,
      marginTop: 2,
    },
    inputShell: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceAlt,
      borderRadius: 14,
      paddingHorizontal: 12,
      minHeight: 50,
      marginBottom: 14,
    },
    input: {
      flex: 1,
      color: theme.text,
      marginLeft: 10,
      fontSize: 15,
    },
    button: {
      backgroundColor: theme.primary,
      minHeight: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 6,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
    link: {
      marginTop: 22,
      textAlign: "center",
      color: theme.primary,
      fontWeight: "600",
      fontSize: 14,
    },
  });
