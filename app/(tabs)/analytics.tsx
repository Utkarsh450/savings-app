import { useTransactions } from "@/src/features/transactions/hooks";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const formatCurrency = (value: number) =>
  `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Period = "Week" | "Month" | "Year";

const isInPeriod = (dateISO: string, period: Period) => {
  const d = new Date(dateISO);
  const now = new Date();
  if (Number.isNaN(d.getTime())) return false;
  if (period === "Week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return d >= start && d <= now;
  }
  if (period === "Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return d.getFullYear() === now.getFullYear();
};

export default function AnalyticsScreen() {
  const { theme } = useAppTheme();
  const { transactions, loading, error, summary, fetchTransactions } = useTransactions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [period, setPeriod] = useState<Period>("Week");

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const filteredTransactions = useMemo(() => transactions.filter((item) => isInPeriod(item.txDate, period)), [transactions, period]);
  const totalSpent = filteredTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = filteredTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalSpent;

  const trendData = useMemo(() => {
    const now = new Date();
    if (period === "Week") {
      return Array.from({ length: 7 }, (_, offset) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - offset));
        const total = filteredTransactions
          .filter((item) => new Date(item.txDate).toDateString() === d.toDateString() && item.type === "expense")
          .reduce((sum, item) => sum + item.amount, 0);
        return { label: d.toLocaleDateString([], { weekday: "short" }), total };
      });
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
        const bucketIndex = Math.min(Math.floor((new Date(item.txDate).getDate() - 1) / 7), 3);
        buckets[bucketIndex].total += item.amount;
      });
      return buckets;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((label, index) => ({
      label,
      total: filteredTransactions
        .filter((item) => new Date(item.txDate).getMonth() === index && item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
    }));
  }, [filteredTransactions, period]);

  const maxTrendValue = Math.max(...trendData.map((item) => item.total), 1);

  const categories = useMemo(() => {
    const expenseItems = filteredTransactions.filter((item) => item.type === "expense");
    const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const map = new Map<string, number>();
    for (const tx of expenseItems) {
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpense > 0 ? amount / totalExpense : 0,
      }));
  }, [filteredTransactions]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>Analytics</Text>
              <Text style={styles.title}>Spending intelligence</Text>
            </View>
            <View style={styles.iconButton}>
              <Ionicons name="stats-chart-outline" size={18} color="#F7F4EC" />
            </View>
          </View>

          <View style={styles.periodRow}>
            {(["Week", "Month", "Year"] as const).map((item) => (
              <TouchableOpacity key={item} style={[styles.periodPill, period === item && styles.activePeriodPill]} onPress={() => setPeriod(item)}>
                <Text style={[styles.periodText, period === item && styles.activePeriodText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statRow}>
            <View style={styles.heroStatMain}>
              <Text style={styles.heroStatLabel}>Total spent</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.heroStatMeta}>Balance snapshot: {`${summary.balance >= 0 ? "+" : "-"}${formatCurrency(summary.balance)}`}</Text>
            </View>
            <View style={styles.heroStatSide}>
              <View style={styles.sideCard}>
                <Text style={styles.sideLabel}>Income</Text>
                <Text style={styles.sideValue}>{formatCurrency(totalIncome)}</Text>
              </View>
              <View style={styles.sideCard}>
                <Text style={styles.sideLabel}>Savings</Text>
                <Text style={styles.sideValue}>{`${savings >= 0 ? "+" : "-"}${formatCurrency(savings)}`}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Spending Trend</Text>
        </View>
        <View style={styles.card}>
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
        <View style={styles.card}>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No expense data in this period.</Text>
          ) : (
            categories.map((item, index) => (
              <View key={item.name} style={styles.categoryBlock}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${item.percent * 100}%` }]} />
                </View>
                {index < categories.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 104, gap: 14 },
    heroCard: { backgroundColor: "#090909", borderRadius: 34, padding: 18, borderWidth: 1, borderColor: "#1F1F1F", gap: 14 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    eyebrow: { color: "#A39D91", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 6 },
    title: { fontSize: 30, fontWeight: "800", color: "#F7F4EC", letterSpacing: -0.7, maxWidth: 220 },
    iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#171717", borderWidth: 1, borderColor: "#282828", alignItems: "center", justifyContent: "center" },
    periodRow: { flexDirection: "row", gap: 8 },
    periodPill: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: "#2A2A2A", paddingVertical: 11, alignItems: "center", backgroundColor: "#171717" },
    activePeriodPill: { backgroundColor: theme.primary, borderColor: theme.primary },
    periodText: { fontSize: 13, fontWeight: "800", color: "#F7F4EC" },
    activePeriodText: { color: "#111111" },
    statRow: { flexDirection: "row", gap: 12 },
    heroStatMain: { flex: 1.1, backgroundColor: "#F7F4EC", borderRadius: 28, padding: 18, minHeight: 180, justifyContent: "space-between" },
    heroStatLabel: { color: "#706B61", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.9, fontWeight: "700" },
    heroStatValue: { color: "#111111", fontSize: 34, fontWeight: "800", letterSpacing: -0.9 },
    heroStatMeta: { color: "#706B61", fontSize: 12, lineHeight: 18 },
    heroStatSide: { flex: 0.9, gap: 12 },
    sideCard: { flex: 1, borderRadius: 24, backgroundColor: "#171717", borderWidth: 1, borderColor: "#262626", padding: 14, justifyContent: "space-between" },
    sideLabel: { color: "#A39D91", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
    sideValue: { color: "#F7F4EC", fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
    sectionRow: { marginTop: 4 },
    sectionTitle: { fontSize: 20, fontWeight: "800", color: theme.text, letterSpacing: -0.4 },
    card: { backgroundColor: theme.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.border, paddingVertical: 14, paddingHorizontal: 16 },
    barRow: { height: 180, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
    barItem: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 8 },
    bar: { width: "100%", maxWidth: 20, minHeight: 8, borderRadius: 999, backgroundColor: theme.primary },
    barLabel: { color: theme.muted, fontSize: 11, fontWeight: "700" },
    categoryBlock: { paddingVertical: 8 },
    categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    categoryName: { color: theme.text, fontSize: 14, fontWeight: "800" },
    categoryAmount: { color: theme.text, fontSize: 14, fontWeight: "800" },
    track: { height: 10, borderRadius: 999, backgroundColor: theme.surfaceAlt, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 999, backgroundColor: theme.primary },
    separator: { height: 1, backgroundColor: theme.border, marginTop: 12 },
    loadingBox: { height: 180, alignItems: "center", justifyContent: "center", gap: 8 },
    loadingText: { color: theme.muted, fontSize: 13 },
    emptyText: { color: theme.muted, fontSize: 13, paddingVertical: 8 },
    errorText: { color: theme.danger, fontSize: 12 },
  });
