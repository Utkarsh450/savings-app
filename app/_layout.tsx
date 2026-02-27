import { useAuthStore } from "@/src/features/auth/authStore";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { theme } = useAppTheme();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
