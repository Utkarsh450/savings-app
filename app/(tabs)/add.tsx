import { useTransactions } from "@/src/features/transactions/hooks";
import { AppTheme } from "@/src/theme/appTheme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

const incomeCategories = ["Salary", "Freelance", "Bonus", "Investment", "Gift"];
const expenseCategories = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment"];
const paymentMethods = ["Cash", "Card", "UPI", "Bank"];
const datePresets = ["Today", "Yesterday", "Custom"] as const;

const resolveDateISO = (preset: (typeof datePresets)[number], customDate: string) => {
  const now = new Date();

  if (preset === "Today") {
    return now.toISOString();
  }

  if (preset === "Yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }

  const trimmed = customDate.trim();
  const match = /^([0-2]?\d|3[0-1])\/([0]?\d|1[0-2])\/(\d{4})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};

export default function AddScreen() {
  const { theme, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const { addTransaction, saving } = useTransactions();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [selectedDatePreset, setSelectedDatePreset] = useState<(typeof datePresets)[number]>("Today");
  const [customDate, setCustomDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isRecurring, setIsRecurring] = useState(false);
  const [note, setNote] = useState("");

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const parsedAmount = Number(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const displayDate = selectedDatePreset === "Custom" ? customDate.trim() : selectedDatePreset;
  const isFormValid = title.trim().length > 0 && isAmountValid && selectedCategory.length > 0;

  const handleTypeChange = (nextType: "expense" | "income") => {
    setType(nextType);
    setSelectedCategory(nextType === "income" ? "Salary" : "Food");
    setTitle("");
  };

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert("Missing details", "Please add title, amount and category.");
      return;
    }

    const resolvedDate = resolveDateISO(selectedDatePreset, customDate);
    if (!resolvedDate) {
      Alert.alert("Invalid date", "Use DD/MM/YYYY for custom date.");
      return;
    }

    try {
      await addTransaction({
        title,
        amount: parsedAmount,
        type,
        category: selectedCategory,
        paymentMethod,
        note,
        txDate: resolvedDate,
        isRecurring,
      });

      Alert.alert("Saved", "Transaction added successfully.");
      setTitle("");
      setAmount("");
      setNote("");
      setSelectedDatePreset("Today");
      setCustomDate("");
      setIsRecurring(false);
      router.push("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not save transaction.";
      Alert.alert("Save failed", message);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Add Transaction</Text>
            <Text style={styles.subtitle}>Fill details once, save confidently.</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/(tabs)")}>
            <Ionicons name="home-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typePill, type === "expense" && styles.activePill]}
            onPress={() => handleTypeChange("expense")}
          >
            <Ionicons name="arrow-up-outline" size={14} color={type === "expense" ? "#FFFFFF" : theme.text} />
            <Text style={[styles.pillText, type === "expense" && styles.activePillText]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typePill, type === "income" && styles.activePill]}
            onPress={() => handleTypeChange("income")}
          >
            <Ionicons name="arrow-down-outline" size={14} color={type === "income" ? "#FFFFFF" : theme.text} />
            <Text style={[styles.pillText, type === "income" && styles.activePillText]}>Income</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountSign}>{type === "income" ? "+" : "-"}</Text>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#DDE9FF"
              style={styles.amountInput}
            />
          </View>
          <Text style={styles.amountHint}>{isAmountValid ? "Looks good" : "Enter a valid amount greater than 0"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={type === "income" ? "e.g. Freelance payout" : "e.g. Lunch at cafe"}
            placeholderTextColor={theme.muted}
            style={styles.textInput}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipWrap}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, selectedCategory === item && styles.activeChip]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.chipText, selectedCategory === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.chipWrap}>
            {datePresets.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, selectedDatePreset === item && styles.activeChip]}
                onPress={() => setSelectedDatePreset(item)}
              >
                <Text style={[styles.chipText, selectedDatePreset === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedDatePreset === "Custom" ? (
            <TextInput
              value={customDate}
              onChangeText={setCustomDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={theme.muted}
              style={styles.textInput}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.chipWrap}>
            {paymentMethods.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, paymentMethod === item && styles.activeChip]}
                onPress={() => setPaymentMethod(item)}
              >
                <Text style={[styles.chipText, paymentMethod === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.sectionTitle}>Recurring</Text>
              <Text style={styles.helperText}>Turn on for monthly bills or fixed income.</Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              thumbColor="#FFFFFF"
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any detail"
            placeholderTextColor={theme.muted}
            multiline
            numberOfLines={3}
            style={styles.noteInput}
          />
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.previewValue}>
            {type === "income" ? "+" : "-"}${isAmountValid ? parsedAmount.toFixed(2) : "0.00"}
          </Text>
          <Text style={styles.previewMeta}>
            {(title.trim() || "Untitled")} • {selectedCategory} • {displayDate || "No date"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (!isFormValid || saving) && styles.disabledButton]}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={!isFormValid || saving}
        >
          <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save Transaction"}</Text>
        </TouchableOpacity>
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
      paddingTop: 56,
      paddingBottom: 116,
      gap: 8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
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
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    typeRow: {
      flexDirection: "row",
      gap: 8,
    },
    typePill: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 11,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: theme.surface,
    },
    activePill: {
      backgroundColor: theme.primary,
      borderColor: isDark ? "#6EA5FF" : "#1F62E5",
    },
    pillText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    activePillText: {
      color: "#FFFFFF",
    },
    amountCard: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? "#5A9CFF" : "#1961E5",
      padding: 18,
    },
    amountLabel: {
      color: "#DDE9FF",
      fontSize: 13,
      marginBottom: 8,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    amountSign: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "700",
      marginRight: 2,
    },
    currencySymbol: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "700",
      marginTop: 1,
    },
    amountInput: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 34,
      fontWeight: "700",
      paddingVertical: 0,
      letterSpacing: -0.7,
    },
    amountHint: {
      marginTop: 6,
      color: "#DDE9FF",
      fontSize: 12,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      gap: 8,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    helperText: {
      marginTop: 2,
      color: theme.muted,
      fontSize: 12,
    },
    textInput: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.text,
      backgroundColor: theme.surfaceAlt,
      fontSize: 14,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      borderRadius: 21,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 7,
      paddingHorizontal: 12,
      backgroundColor: theme.surfaceAlt,
    },
    activeChip: {
      backgroundColor: theme.primary,
      borderColor: isDark ? "#6EA5FF" : "#1F62E5",
    },
    chipText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    activeChipText: {
      color: "#FFFFFF",
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    noteInput: {
      minHeight: 88,
      textAlignVertical: "top",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 11,
      color: theme.text,
      backgroundColor: theme.surfaceAlt,
      fontSize: 14,
    },
    previewCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      gap: 4,
    },
    previewLabel: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: "600",
    },
    previewValue: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    previewMeta: {
      color: theme.muted,
      fontSize: 13,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
      borderWidth: 1,
      borderColor: isDark ? "#6EA5FF" : "#1F62E5",
    },
    disabledButton: {
      opacity: 0.55,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
