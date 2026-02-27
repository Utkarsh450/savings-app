import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AddScreen() {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>
      <Text style={styles.subtitle}>Create a new income or expense entry.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
      {isDark ? <Text style={styles.hint}>Dark mode enabled</Text> : null}
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
      fontSize: 15,
      color: theme.muted,
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
    hint: {
      marginTop: 12,
      color: theme.muted,
      fontSize: 12,
      textAlign: "center",
    },
  });
