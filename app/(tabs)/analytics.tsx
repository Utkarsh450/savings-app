import { useTransactions } from "@/src/features/transactions/hooks";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const formatCurrency = (value: number) => {
  return `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

type Period = "Week" | "Month" | "Year";

const isInPeriod = (dateISO: string, period: Period) => {
  const d = new Date(dateISO);
  const now = new Date();

  if (Number.isNaN(d.getTime())) {
    return false;
  }

  if (period === "Week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return d >= start && d <= now;
  }

  if (period === "Month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  return d.getFullYear() === now.getFullYear();
};

export default function AnalyticsScreen() {
  const { theme, isDark } = useAppTheme();
  const { transactions, loading, error, summary, fetchTransactions } = useTransactions();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const [period, setPeriod] = useState<Period>("Week");

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const filteredTransactions = useMemo(
    () => transactions.filter((item) => isInPeriod(item.txDate, period)),
    [transactions, period]
  );

  const totalSpent = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const savings = totalIncome - totalSpent;

  const trendData = useMemo(() => {
    const now = new Date();

    if (period === "Week") {
      const buckets: { label: string; total: number }[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString([], { weekday: "short" });
        const key = d.toDateString();
        const total = filteredTransactions
          .filter((item) => new Date(item.txDate).toDateString() === key && item.type === "expense")
          .reduce((sum, item) => sum + item.amount, 0);
        buckets.push({ label, total });
      }
      return buckets;
    }

    if (period === "Month") {
      const buckets = [
        { label: "W1", total: 0 },
        { label: "W2", total: 0 },
        { label: "W3", total: 0 },
        { label: "W4", total: 0 },
      ];

      filteredTransactions.forEach((item) => {
        if (item.type !== "expense") return;
        const day = new Date(item.txDate).getDate();
        const bucketIndex = Math.min(Math.floor((day - 1) / 7), 3);
        buckets[bucketIndex].total += item.amount;
      });

      return buckets;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((label, index) => {
      const total = filteredTransactions
        .filter((item) => new Date(item.txDate).getMonth() === index && item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);
      return { label, total };
    });
  }, [filteredTransactions, period]);

  const maxTrendValue = Math.max(...trendData.map((item) => item.total), 1);

  const categories = useMemo(() => {
    const expenseItems = filteredTransactions.filter((item) => item.type === "expense");
    const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const map = new Map<string, number>();

    for (const tx of expenseItems) {
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    }

    const palette = ["#4E8DFF", "#F08C2E", "#B66AFF", "#22A06B", "#E35D6A"];

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount], index) => ({
        name,
        amount,
        percent: totalExpense > 0 ? amount / totalExpense : 0,
        color: palette[index % palette.length],
      }));
  }, [filteredTransactions]);

  const insights = useMemo(() => {
    const expenseCount = filteredTransactions.filter((item) => item.type === "expense").length;
    const incomeCount = filteredTransactions.filter((item) => item.type === "income").length;
    const topCategory = categories[0];

    const points = [
      `${expenseCount} expense transactions logged in this ${period.toLowerCase()}.`,
      `${incomeCount} income transactions logged in this ${period.toLowerCase()}.`,
      topCategory
        ? `Top spend category: ${topCategory.name} (${formatCurrency(topCategory.amount)}).`
        : "Add expense data to see category insights.",
    ];

    if (savings >= 0) {
      points.push(`Net savings for this ${period.toLowerCase()}: +${formatCurrency(savings)}.`);
    } else {
      points.push(`Net cashflow for this ${period.toLowerCase()}: -${formatCurrency(savings)}.`);
    }

    return points;
  }, [categories, filteredTransactions, period, savings]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Live insights from your Appwrite transactions.</Text>
          </View>
          <View style={styles.iconButton}>
            <Ionicons name="stats-chart-outline" size={18} color={theme.text} />
          </View>
        </View>

        <View style={styles.periodRow}>
          {(["Week", "Month", "Year"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.periodPill, period === item && styles.activePeriodPill]}
              onPress={() => setPeriod(item)}
            >
              <Text style={[styles.periodText, period === item && styles.activePeriodText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Spent ({period})</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalSpent)}</Text>
          <View style={styles.balanceFooter}>
            <Ionicons name="wallet-outline" size={14} color="#DDE9FF" />
            <Text style={styles.balanceMeta}>Balance snapshot: {`${summary.balance >= 0 ? "+" : "-"}${formatCurrency(summary.balance)}`}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.cardLabel}>Income ({period})</Text>
            <Text style={styles.cardAmount}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Savings ({period})</Text>
            <Text style={styles.cardAmount}>{`${savings >= 0 ? "+" : "-"}${formatCurrency(savings)}`}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Spending Trend</Text>
        </View>
        <View style={styles.chartCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : (
            <View style={styles.barRow}>
              {trendData.map((item) => {
                const heightPercent = Math.max((item.total / maxTrendValue) * 100, item.total > 0 ? 12 : 4);
                return (
                  <View key={item.label} style={styles.barItem}>
                    <View style={[styles.bar, { height: `${heightPercent}%` }]} />
                    <Text style={styles.barLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
        </View>
        <View style={styles.listCard}>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No expense data in this period.</Text>
          ) : (
            categories.map((item, index) => (
              <View key={item.name} style={styles.categoryBlock}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${item.percent * 100}%`, backgroundColor: item.color }]} />
                </View>
                {index < categories.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Insights</Text>
        </View>
        <View style={styles.listCard}>
          {insights.map((item, index) => (
            <View key={item} style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <Ionicons name="bulb-outline" size={14} color={theme.primary} />
              </View>
              <Text style={styles.insightText}>{item}</Text>
              {index < insights.length - 1 ? <View style={styles.separatorInset} /> : null}
            </View>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
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
      paddingBottom: 100,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.3,
    },
    subtitle: {
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
    periodRow: {
      flexDirection: "row",
      gap: 8,
    },
    periodPill: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    activePeriodPill: {
      backgroundColor: theme.primary,
      borderColor: isDark ? "#6EA5FF" : "#1F62E5",
    },
    periodText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    activePeriodText: {
      color: "#FFFFFF",
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
      fontSize: 34,
      fontWeight: "700",
      letterSpacing: -0.7,
    },
    balanceFooter: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.2,
    },
    chartCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 10,
    },
    barRow: {
      height: 160,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
    },
    barItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 7,
    },
    bar: {
      width: "100%",
      maxWidth: 18,
      minHeight: 8,
      borderRadius: 10,
      backgroundColor: theme.primary,
    },
    barLabel: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: "600",
    },
    listCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    categoryBlock: {
      paddingVertical: 8,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
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
      fontWeight: "600",
    },
    categoryAmount: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    track: {
      height: 8,
      borderRadius: 6,
      backgroundColor: theme.surfaceAlt,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 6,
    },
    insightRow: {
      paddingVertical: 10,
      position: "relative",
      paddingLeft: 40,
      minHeight: 46,
      justifyContent: "center",
    },
    insightIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 10,
      left: 0,
    },
    insightText: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 20,
      paddingRight: 6,
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginTop: 10,
    },
    separatorInset: {
      position: "absolute",
      bottom: -1,
      left: 40,
      right: 0,
      height: 1,
      backgroundColor: theme.border,
    },
    loadingBox: {
      height: 160,
      alignItems: "center",
      justifyContent: "center",
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
  });
