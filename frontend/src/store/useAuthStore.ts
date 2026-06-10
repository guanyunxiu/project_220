import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  role: 'user' | 'author' | 'admin';
  balance?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  unreadCount: number;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setUnreadCount: (count: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      unreadCount: 3,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
