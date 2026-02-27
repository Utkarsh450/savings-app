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
