import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUsername = create((set) => ({
  username: "",
  setUsername: (username) => set({ username })
}))

const useAuthStore = create(
  persist((set) => ({
    user: null,
    isAuth: false,
    isLoading: false,

    setAuth: (user) => set({ user, isAuth: true, isLoading: false }),
    clearAuth: () => set({ user: null, isAuth: false, isLoading: false }),
  }))
);

export { useAuthStore, useUsername };
