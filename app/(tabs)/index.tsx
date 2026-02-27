import { logoutUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const transactions = [
  { id: "1", title: "Salary Credit", date: "Today, 09:20 AM", amount: "+$2,400.00", positive: true },
  { id: "2", title: "Grocery Store", date: "Today, 07:12 AM", amount: "-$58.30", positive: false },
  { id: "3", title: "Netflix", date: "Yesterday", amount: "-$14.99", positive: false },
  { id: "4", title: "Freelance Payment", date: "Yesterday", amount: "+$420.00", positive: true },
];

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      router.replace("/(auth)/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Logout Failed", message);
    }
  };

  const goToAnalytics = () => router.push("/(tabs)/analytics");
  const goToAdd = () => router.push("/(tabs)/add");

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Hi {user?.name || "User"}</Text>
            <Text style={styles.helperText}>Here is your money snapshot</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$40,500.80</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceDot} />
            <Text style={styles.balanceMeta}>Updated just now</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={styles.cardAmount}>+$3,920.00</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.cardAmount}>-$1,184.25</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={goToAnalytics}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {transactions.map((item, index) => (
            <View key={item.id}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIconWrap}>
                    <Ionicons name={item.positive ? "arrow-down" : "arrow-up"} size={14} color={theme.text} />
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>{item.title}</Text>
                    <Text style={styles.transactionDate}>{item.date}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    item.positive ? styles.positiveAmount : styles.negativeAmount,
                  ]}
                >
                  {item.amount}
                </Text>
              </View>
              {index < transactions.length - 1 ? <View style={styles.separator} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={goToAdd}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: AppTheme, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 120,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    greeting: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.4,
    },
    helperText: {
      marginTop: 4,
      fontSize: 14,
      color: theme.muted,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    balanceCard: {
      backgroundColor: theme.primary,
      borderRadius: 24,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#5A9CFF" : "#1961E5",
    },
    balanceLabel: {
      color: "#DDE9FF",
      fontSize: 13,
      marginBottom: 8,
    },
    balanceAmount: {
      color: "#FFFFFF",
      fontSize: 36,
      fontWeight: "700",
      letterSpacing: -0.9,
    },
    balanceFooter: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    balanceDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#FFFFFF",
    },
    balanceMeta: {
      color: "#DDE9FF",
      fontSize: 12,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 15,
      borderWidth: 1,
    },
    incomeCard: {
      backgroundColor: isDark ? "#183157" : "#EAF1FF",
      borderColor: isDark ? "#2A4D7F" : "#D2E2FF",
    },
    expenseCard: {
      backgroundColor: isDark ? "#1A335A" : "#F2F7FF",
      borderColor: isDark ? "#2B4E80" : "#DCE8FF",
    },
    cardLabel: {
      color: isDark ? "#CDE0FF" : "#51709C",
      fontSize: 13,
      marginBottom: 6,
    },
    cardAmount: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.2,
    },
    sectionAction: {
      fontSize: 13,
      color: theme.muted,
      fontWeight: "600",
    },
    listCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    transactionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    transactionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    transactionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    transactionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    transactionDate: {
      color: theme.muted,
      fontSize: 12,
      marginTop: 2,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: "700",
    },
    positiveAmount: {
      color: "#1E6BFF",
    },
    negativeAmount: {
      color: "#B94A4A",
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
    },
    fab: {
      position: "absolute",
      right: 24,
      bottom: 28,
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#6BA5FF" : "#1A63EA",
    },
  });
