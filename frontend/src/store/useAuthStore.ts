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

export type NotificationItemType = 'system' | 'reward' | 'comment' | 'reply' | 'subscription' | 'audit';

export interface NotificationItem {
  id: number;
  type: NotificationItemType;
  title: string;
  content: string;
  relatedId?: number;
  relatedUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  unreadCount: number;
  notifications: NotificationItem[];
  readWorkUpdates: number[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: number) => void;
  markWorkUpdateRead: (workId: number) => void;
  isWorkUpdateRead: (workId: number) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      unreadCount: 3,
      notifications: [
        {
          id: 1,
          type: 'system',
          title: '欢迎来到墨染',
          content: '欢迎注册成为墨染的一员，现在开始你的创作之旅吧！',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 2,
          type: 'subscription',
          title: '作品更新提醒',
          content: '你订阅的《星辰大海的冒险》已更新第156章！',
          relatedId: 1,
          relatedUrl: '/work/1',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'reward',
          title: '收到打赏',
          content: '读者「书虫123」给你的作品打赏了100墨币！',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
      ],
      readWorkUpdates: [],

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),

      setUnreadCount: (count) => set({ unreadCount: count }),

      addNotification: (notification) => {
        const newItem: NotificationItem = {
          ...notification,
          id: Date.now(),
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newItem, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markNotificationRead: (id) =>
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          const wasUnread = target && !target.isRead;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      deleteNotification: (id) =>
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          const wasUnread = target && !target.isRead;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      markWorkUpdateRead: (workId) =>
        set((state) => {
          if (state.readWorkUpdates.includes(workId)) return state;
          return { readWorkUpdates: [...state.readWorkUpdates, workId] };
        }),

      isWorkUpdateRead: (workId) => get().readWorkUpdates.includes(workId),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        readWorkUpdates: state.readWorkUpdates,
      }),
    }
  )
);
