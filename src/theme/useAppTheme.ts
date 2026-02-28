import { useThemeStore } from "@/src/features/theme/themeStore";
import { themesByVariant } from "@/src/theme/appTheme";
import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const variant = useThemeStore((state) => state.variant);
  const systemScheme = useColorScheme();

  const isDark = mode === "dark" || (mode === "system" && systemScheme === "dark");
  const selected = themesByVariant[variant];
  const theme = isDark ? selected.dark : selected.light;

  return {
    isDark,
    theme,
    mode,
    variant,
  };
};
