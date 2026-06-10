import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

interface AppState {
  theme: ThemeMode;
  collapsed: boolean;
  locale: string;
  notifications: AppNotification[];
  unreadCount: number;
  breadcrumb: { label: string; path?: string }[];

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setLocale: (locale: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;
  setBreadcrumb: (breadcrumb: { label: string; path?: string }[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      collapsed: false,
      locale: 'zh-CN',
      notifications: [],
      unreadCount: 0,
      breadcrumb: [],

      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),

      toggleCollapsed: () =>
        set((state) => ({ collapsed: !state.collapsed })),

      setCollapsed: (collapsed) => set({ collapsed }),

      setLocale: (locale) => set({ locale }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: generateId() },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      setUnreadCount: (count) => set({ unreadCount: count }),

      setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        collapsed: state.collapsed,
        locale: state.locale,
      }),
    }
  )
);
