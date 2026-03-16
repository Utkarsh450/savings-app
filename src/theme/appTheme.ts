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
    background: "#F3F1EA",
    surface: "#FBF9F2",
    surfaceAlt: "#ECE8DE",
    text: "#0B0B0C",
    muted: "#6C6A63",
    border: "#DDD7C8",
    primary: "#D6FF39",
    danger: "#D44747",
    tabBg: "#111111",
    tabBorder: "#242424",
    tabActive: "#D6FF39",
    tabInactive: "#8E8B82",
  },
  dark: {
    background: "#050505",
    surface: "#101010",
    surfaceAlt: "#171717",
    text: "#F5F2E8",
    muted: "#8E8A80",
    border: "#232323",
    primary: "#D6FF39",
    danger: "#E46C6C",
    tabBg: "#0C0C0D",
    tabBorder: "#212121",
    tabActive: "#D6FF39",
    tabInactive: "#706E67",
  },
};

const graphite: ThemeSet = {
  light: {
    background: "#F0EEE6",
    surface: "#FCFBF6",
    surfaceAlt: "#E9E5D9",
    text: "#111111",
    muted: "#6E6B64",
    border: "#D9D3C6",
    primary: "#CFFB2C",
    danger: "#C84545",
    tabBg: "#111111",
    tabBorder: "#262626",
    tabActive: "#CFFB2C",
    tabInactive: "#8A8A8A",
  },
  dark: {
    background: "#060606",
    surface: "#121212",
    surfaceAlt: "#1B1B1B",
    text: "#F6F4ED",
    muted: "#A29E92",
    border: "#2B2B2B",
    primary: "#CFFB2C",
    danger: "#E46C6C",
    tabBg: "#141414",
    tabBorder: "#272727",
    tabActive: "#CFFB2C",
    tabInactive: "#7E7E7E",
  },
};

const mint: ThemeSet = {
  light: {
    background: "#EFF5EC",
    surface: "#F9FCF7",
    surfaceAlt: "#E2ECE0",
    text: "#101510",
    muted: "#657063",
    border: "#D3DDD0",
    primary: "#B9FF54",
    danger: "#CF4D4D",
    tabBg: "#0F110E",
    tabBorder: "#252A24",
    tabActive: "#B9FF54",
    tabInactive: "#7D9A8E",
  },
  dark: {
    background: "#050805",
    surface: "#101510",
    surfaceAlt: "#171F17",
    text: "#EEF6EA",
    muted: "#8F9D8A",
    border: "#243025",
    primary: "#B9FF54",
    danger: "#E16D6D",
    tabBg: "#0E120E",
    tabBorder: "#212A21",
    tabActive: "#B9FF54",
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
