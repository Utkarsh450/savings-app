import { create } from "zustand";
import { getCurrentUser } from "./authService";
import { AppUser } from "./types";

type AuthState = {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),

  checkAuth: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null, loading: false });
    }
  },
}));
