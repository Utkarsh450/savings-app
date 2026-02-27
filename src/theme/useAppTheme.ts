import { useThemeStore } from "@/src/features/theme/themeStore";
import { darkTheme, lightTheme } from "@/src/theme/appTheme";
import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const systemScheme = useColorScheme();

  const isDark = mode === "dark" || (mode === "system" && systemScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  return {
    isDark,
    theme,
    mode,
  };
};
