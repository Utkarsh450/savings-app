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
  { id: "a1", label: "Expense", icon: "remove-circle-outline" as const, route: "/(tabs)/add" as const },
  { id: "a2", label: "Income", icon: "add-circle-outline" as const, route: "/(tabs)/add" as const },
  { id: "a3", label: "Insights", icon: "stats-chart-outline" as const, route: "/(tabs)/analytics" as const },
];

const formatCurrency = (value: number) =>
  `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatTransactionDate = (dateISO: string) => {
  const date = new Date(dateISO);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "Unknown date";
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { transactions, loading, error, summary, fetchTransactions } = useTransactions();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
      if (tx.type !== "expense") continue;
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, amount], index) => ({
        id: `${name}-${index}`,
        name,
        amount: formatCurrency(amount),
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

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroShell}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>Hi, {user?.name || "User"}</Text>
              <Text style={styles.helperText}>Your money cockpit is live.</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#F7F4EC" />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceRow}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Net balance</Text>
              <Text style={styles.balanceAmount}>{`${summary.balance >= 0 ? "+" : "-"}${formatCurrency(summary.balance)}`}</Text>
              <View style={styles.balanceMetaRow}>
                <View style={styles.liveDot} />
                <Text style={styles.balanceMeta}>{loading ? "Syncing..." : "Updated from Firebase"}</Text>
              </View>
            </View>

            <View style={styles.heroMiniCol}>
              <View style={styles.miniStatCard}>
                <Text style={styles.miniLabel}>Income</Text>
                <Text style={styles.miniValue}>{`+${formatCurrency(monthIncome)}`}</Text>
              </View>
              <View style={[styles.miniStatCard, styles.miniStatSoft]}>
                <Text style={styles.miniLabel}>Expense</Text>
                <Text style={styles.miniValue}>{`-${formatCurrency(monthExpense)}`}</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickRow}>
            {quickActions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.quickActionCard} onPress={() => router.push(item.route)}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name={item.icon} size={16} color="#111111" />
                </View>
                <Text style={styles.quickActionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
        </View>
        <View style={styles.card}>
          {goals.map((goal, index) => {
            const progress = Math.min(goal.saved / goal.target, 1);
            return (
              <View key={goal.id}>
                <View style={styles.goalRow}>
                  <View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalMeta}>${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}</Text>
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
          <Text style={styles.sectionTitle}>Category Radar</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/analytics")}>
            <Text style={styles.sectionAction}>Open</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {topExpenseCategories.length === 0 ? (
            <Text style={styles.emptyText}>No expense data yet.</Text>
          ) : (
            topExpenseCategories.map((item, index) => (
              <View key={item.id}>
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryAmount}>{item.amount}</Text>
                </View>
                {index < topExpenseCategories.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/analytics")}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
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
                      <Ionicons name={item.type === "income" ? "arrow-down" : "arrow-up"} size={14} color="#111111" />
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
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => router.push("/(tabs)/add")}>
        <Ionicons name="add" size={28} color="#111111" />
      </TouchableOpacity>
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
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 116,
      gap: 14,
    },
    heroShell: {
      backgroundColor: "#090909",
      borderRadius: 34,
      padding: 18,
      borderWidth: 1,
      borderColor: "#1F1F1F",
      gap: 16,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    greeting: {
      fontSize: 30,
      fontWeight: "800",
      color: "#F7F4EC",
      letterSpacing: -0.7,
    },
    helperText: {
      marginTop: 4,
      fontSize: 14,
      color: "#9E988B",
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#171717",
      borderWidth: 1,
      borderColor: "#282828",
      alignItems: "center",
      justifyContent: "center",
    },
    balanceRow: {
      flexDirection: "row",
      gap: 12,
    },
    balanceCard: {
      flex: 1.15,
      backgroundColor: "#F7F4EC",
      borderRadius: 28,
      padding: 18,
      minHeight: 178,
      justifyContent: "space-between",
    },
    balanceLabel: {
      color: "#716B60",
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.9,
    },
    balanceAmount: {
      color: "#111111",
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: -1,
    },
    balanceMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D6FF39",
    },
    balanceMeta: {
      color: "#716B60",
      fontSize: 12,
    },
    heroMiniCol: {
      flex: 0.85,
      gap: 12,
    },
    miniStatCard: {
      flex: 1,
      borderRadius: 24,
      backgroundColor: "#171717",
      borderWidth: 1,
      borderColor: "#262626",
      padding: 14,
      justifyContent: "space-between",
    },
    miniStatSoft: {
      backgroundColor: "#121212",
    },
    miniLabel: {
      color: "#A09B90",
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    miniValue: {
      color: "#F7F4EC",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    quickRow: {
      flexDirection: "row",
      gap: 8,
    },
    quickActionCard: {
      flex: 1,
      borderRadius: 22,
      backgroundColor: "#F7F4EC",
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 8,
    },
    quickActionIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#D6FF39",
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionText: {
      color: "#111111",
      fontWeight: "800",
      fontSize: 12,
      textAlign: "center",
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.4,
    },
    sectionAction: {
      fontSize: 13,
      color: theme.muted,
      fontWeight: "700",
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    goalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 8,
    },
    goalName: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "800",
    },
    goalMeta: {
      color: theme.muted,
      marginTop: 4,
      fontSize: 12,
    },
    goalPercent: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.surfaceAlt,
      overflow: "hidden",
      marginBottom: 12,
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: 999,
    },
    categoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
    },
    categoryName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    categoryAmount: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },
    transactionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    },
    transactionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    transactionIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    transactionTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },
    transactionDate: {
      color: theme.muted,
      fontSize: 12,
      marginTop: 3,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: "800",
    },
    positiveAmount: {
      color: theme.primary,
    },
    negativeAmount: {
      color: theme.text,
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
      paddingVertical: 12,
    },
    errorText: {
      color: theme.danger,
      fontSize: 12,
      marginTop: 2,
    },
    fab: {
      position: "absolute",
      right: 22,
      bottom: 92,
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.primary,
      elevation: 8,
      shadowColor: "#000000",
      shadowOpacity: 0.28,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
    },
  });
