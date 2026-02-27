import { loginUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { AppTheme } from "@/src/theme/appTheme";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Track your savings smartly</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.muted}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.muted}
        secureTextEntry
        keyboardType="default"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")} disabled={loading}>
        <Text style={styles.link}>Do not have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      color: theme.muted,
      marginBottom: 32,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      padding: 14,
      borderRadius: 10,
      marginBottom: 16,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
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
      marginTop: 20,
      textAlign: "center",
      color: theme.primary,
      fontWeight: "600",
    },
  });
