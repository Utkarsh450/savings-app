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
      const cleanedEmail = email.trim().toLowerCase();
      const cleanedPassword = password.trim();
      const user = await registerUser(cleanedEmail, cleanedPassword, name);
      setUser(user);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start building your savings journey</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={theme.muted} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color={theme.muted} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.muted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.muted} />
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.muted}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} disabled={loading}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 28,
      justifyContent: "center",
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 15,
      color: theme.muted,
      marginBottom: 36,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 18,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 16,
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
      marginTop: 24,
      textAlign: "center",
      color: theme.primary,
      fontWeight: "500",
    },
  });
