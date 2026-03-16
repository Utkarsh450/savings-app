import { create } from "zustand";
import { ThemeVariant } from "@/src/theme/appTheme";

export type ThemeMode = "system" | "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  variant: ThemeVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "dark",
  variant: "blueprint",
  setMode: (mode) => set({ mode }),
  setVariant: (variant) => set({ variant }),
}));
