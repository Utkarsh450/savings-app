export type AppTheme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
};

export type ThemeVariant = "blueprint" | "graphite" | "mint";

type ThemeSet = {
  light: AppTheme;
  dark: AppTheme;
};

const blueprint: ThemeSet = {
  light: {
    background: "#F6F8FC",
    surface: "#FFFFFF",
    surfaceAlt: "#EFF3FA",
    text: "#12233A",
    muted: "#6A7A93",
    border: "#E1E8F5",
    primary: "#1F6BFF",
    danger: "#D44747",
    tabBg: "#FFFFFF",
    tabBorder: "#DBE4F2",
    tabActive: "#1F6BFF",
    tabInactive: "#8A9BB8",
  },
  dark: {
    background: "#0F1725",
    surface: "#162234",
    surfaceAlt: "#1D2D46",
    text: "#EDF4FF",
    muted: "#A1B2CC",
    border: "#2A3F60",
    primary: "#4A8CFF",
    danger: "#E46C6C",
    tabBg: "#122033",
    tabBorder: "#223957",
    tabActive: "#C5D9FF",
    tabInactive: "#8299BC",
  },
};

const graphite: ThemeSet = {
  light: {
    background: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceAlt: "#EFEFEF",
    text: "#1C1C1C",
    muted: "#666666",
    border: "#E2E2E2",
    primary: "#111111",
    danger: "#C84545",
    tabBg: "#FFFFFF",
    tabBorder: "#E0E0E0",
    tabActive: "#111111",
    tabInactive: "#8A8A8A",
  },
  dark: {
    background: "#0F0F0F",
    surface: "#171717",
    surfaceAlt: "#212121",
    text: "#F3F3F3",
    muted: "#A8A8A8",
    border: "#2B2B2B",
    primary: "#FAFAFA",
    danger: "#E46C6C",
    tabBg: "#141414",
    tabBorder: "#272727",
    tabActive: "#FAFAFA",
    tabInactive: "#7E7E7E",
  },
};

const mint: ThemeSet = {
  light: {
    background: "#F3FAF8",
    surface: "#FFFFFF",
    surfaceAlt: "#EAF4F1",
    text: "#133227",
    muted: "#5D786D",
    border: "#D8E8E2",
    primary: "#0E8F67",
    danger: "#CF4D4D",
    tabBg: "#FFFFFF",
    tabBorder: "#D2E4DE",
    tabActive: "#0E8F67",
    tabInactive: "#7D9A8E",
  },
  dark: {
    background: "#0D1C19",
    surface: "#152A25",
    surfaceAlt: "#1C3932",
    text: "#E8F7F1",
    muted: "#98B7AD",
    border: "#285044",
    primary: "#2FB98D",
    danger: "#E16D6D",
    tabBg: "#122420",
    tabBorder: "#214236",
    tabActive: "#BEEFD9",
    tabInactive: "#789D91",
  },
};

export const themesByVariant: Record<ThemeVariant, ThemeSet> = {
  blueprint,
  graphite,
  mint,
};

export const lightTheme: AppTheme = {
  background: "#F3F7FF",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF4FF",
  text: "#102A43",
  muted: "#6B7A90",
  border: "#D7E4FF",
  primary: "#1E6BFF",
  danger: "#CF3F3F",
  tabBg: "#FFFFFF",
  tabBorder: "#DCE7FF",
  tabActive: "#1E6BFF",
  tabInactive: "#8EA2C8",
};

export const darkTheme: AppTheme = {
  background: "#0D1A2E",
  surface: "#132541",
  surfaceAlt: "#1A3357",
  text: "#ECF3FF",
  muted: "#9FB1CC",
  border: "#23426F",
  primary: "#4D8DFF",
  danger: "#E46C6C",
  tabBg: "#10213A",
  tabBorder: "#1E3960",
  tabActive: "#BFD7FF",
  tabInactive: "#7D97BC",
};
