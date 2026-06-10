import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '@/types';
import { setToken, setRefreshToken, clearTokens } from '@/utils/request';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  login: (response: LoginResponse) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,

      setUser: (user) => set({ user }),

      login: (response) => {
        setToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isLoggedIn: true,
        });
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
