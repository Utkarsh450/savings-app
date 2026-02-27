import { logoutUser } from "@/src/features/auth/authService";
import { useAuthStore } from "@/src/features/auth/authStore";
import { useTransactions } from "@/src/features/transactions/hooks";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const goals = [
  { id: "g1", name: "Emergency Fund", saved: 4200, target: 6000 },
  { id: "g2", name: "Vacation", saved: 1350, target: 2500 },
];

const quickActions = [
  { id: "a1", label: "Add Expense", icon: "remove-circle-outline" as const, route: "/(tabs)/add" as const },
  { id: "a2", label: "Add Income", icon: "add-circle-outline" as const, route: "/(tabs)/add" as const },
  { id: "a3", label: "Insights", icon: "stats-chart-outline" as const, route: "/(tabs)/analytics" as const },
];

const formatCurrency = (value: number) => {
  return `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatTransactionDate = (dateISO: string) => {
  const date = new Date(dateISO);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { transactions, loading, error, summary, fetchTransactions } = useTransactions();
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const now = new Date();
  const monthIncome = transactions
    .filter((item) => {
      const d = new Date(item.txDate);
      return item.type === "income" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const monthExpense = transactions
    .filter((item) => {
      const d = new Date(item.txDate);
      return item.type === "expense" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const topExpenseCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense") {
        continue;
      }
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    }

    const palette = ["#4E8DFF", "#22A06B", "#F08C2E", "#B66AFF", "#E35D6A"];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, amount], index) => ({
        id: `${name}-${index}`,
        name,
        amount: formatCurrency(amount),
        color: palette[index % palette.length],
      }));
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      router.replace("/(auth)/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again.";
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
            <Text style={styles.helperText}>Here is your live money snapshot</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={styles.balanceAmount}>{`${summary.balance >= 0 ? "+" : "-"}${formatCurrency(summary.balance)}`}</Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceDot} />
            <Text style={styles.balanceMeta}>{loading ? "Syncing..." : "Updated from Appwrite"}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.cardLabel}>Income (Month)</Text>
            <Text style={styles.cardAmount}>{`+${formatCurrency(monthIncome)}`}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Expense (Month)</Text>
            <Text style={styles.cardAmount}>{`-${formatCurrency(monthExpense)}`}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={item.icon} size={16} color={theme.primary} />
              </View>
              <Text style={styles.quickActionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
        </View>
        <View style={styles.listCard}>
          {goals.map((goal, index) => {
            const progress = Math.min(goal.saved / goal.target, 1);
            return (
              <View key={goal.id}>
                <View style={styles.goalRow}>
                  <View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalMeta}>
                      ${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                {index < goals.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <TouchableOpacity onPress={goToAnalytics}>
            <Text style={styles.sectionAction}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryCard}>
          {topExpenseCategories.length === 0 ? (
            <Text style={styles.emptyText}>No expense data yet.</Text>
          ) : (
            topExpenseCategories.map((item) => (
              <View key={item.id} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>{item.amount}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={goToAnalytics}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet. Add your first one.</Text>
          ) : (
            recentTransactions.map((item, index) => (
              <View key={item.id}>
                <View style={styles.transactionRow}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIconWrap}>
                      <Ionicons name={item.type === "income" ? "arrow-down" : "arrow-up"} size={14} color={theme.text} />
                    </View>
                    <View>
                      <Text style={styles.transactionTitle}>{item.title}</Text>
                      <Text style={styles.transactionDate}>{formatTransactionDate(item.txDate)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.transactionAmount, item.type === "income" ? styles.positiveAmount : styles.negativeAmount]}>
                    {`${item.type === "income" ? "+" : "-"}${formatCurrency(item.amount)}`}
                  </Text>
                </View>
                {index < recentTransactions.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="bulb-outline" size={18} color={theme.primary} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Smart tip for today</Text>
            <Text style={styles.tipText}>Review recurring payments weekly to reduce silent spending.</Text>
          </View>
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
      gap: 12,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
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
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
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
    quickActionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 8,
    },
    quickActionIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionText: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
    },
    listCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    goalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 8,
    },
    goalName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    goalMeta: {
      color: theme.muted,
      marginTop: 3,
      fontSize: 12,
    },
    goalPercent: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: "700",
    },
    progressTrack: {
      height: 8,
      borderRadius: 6,
      backgroundColor: theme.surfaceAlt,
      overflow: "hidden",
      marginBottom: 10,
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: 6,
    },
    categoryCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 14,
      gap: 2,
    },
    categoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    categoryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    categoryName: {
      color: theme.text,
      fontSize: 14,
    },
    categoryAmount: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
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
    loadingBox: {
      paddingVertical: 18,
      alignItems: "center",
      gap: 8,
    },
    loadingText: {
      color: theme.muted,
      fontSize: 13,
    },
    emptyText: {
      color: theme.muted,
      fontSize: 13,
      paddingVertical: 8,
    },
    errorText: {
      color: theme.danger,
      fontSize: 12,
      marginTop: 2,
    },
    tipCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginTop: 4,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    tipIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    tipContent: {
      flex: 1,
      gap: 2,
    },
    tipTitle: {
      color: theme.text,
      fontWeight: "700",
      fontSize: 14,
    },
    tipText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 18,
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
      elevation: 4,
      shadowColor: "#000000",
      shadowOpacity: isDark ? 0.35 : 0.14,
      shadowOffset: { width: 0, height: 7 },
      shadowRadius: 10,
    },
  });
