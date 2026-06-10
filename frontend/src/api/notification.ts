import { http } from '@/utils/request';
import type {
  Notification,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  content?: string;
  type?: string;
  priority?: string;
  imageUrl?: string;
  linkUrl?: string;
  data?: any;
  relatedId?: string;
  relatedType?: string;
  expiresAt?: Date;
}

export const notificationApi = {
  getNotifications: (params?: PaginationParams & { type?: string; isRead?: boolean }) =>
    http.get<PaginatedResponse<Notification>>('/notifications', { params }),

  getUnreadNotifications: (params?: PaginationParams & { type?: string }) =>
    http.get<PaginatedResponse<Notification>>('/notifications/unread', { params }),

  getReadNotifications: (params?: PaginationParams & { type?: string }) =>
    http.get<PaginatedResponse<Notification>>('/notifications/read', { params }),

  getNotificationById: (id: string) =>
    http.get<Notification>(`/notifications/${id}`),

  createNotification: (data: CreateNotificationDto) =>
    http.post<Notification>('/notifications', data),

  markAsRead: (id: string) =>
    http.post<Notification>(`/notifications/${id}/read`),

  markAsUnread: (id: string) =>
    http.post<Notification>(`/notifications/${id}/unread`),

  markAllAsRead: () =>
    http.post<void>('/notifications/mark-all-read'),

  deleteNotification: (id: string) =>
    http.delete<void>(`/notifications/${id}`),

  batchMarkAsRead: (ids: string[]) =>
    http.post<void>('/notifications/batch-read', { ids }),

  batchDelete: (ids: string[]) =>
    http.post<void>('/notifications/batch-delete', { ids }),

  clearAllRead: () =>
    http.delete<void>('/notifications/clear-read'),

  clearAll: () =>
    http.delete<void>('/notifications/all'),

  getUnreadCount: () =>
    http.get<{ total: number; byType: Record<string, number> }>(
      '/notifications/unread-count'
    ),

  pinNotification: (id: string) =>
    http.post<Notification>(`/notifications/${id}/pin`),

  unpinNotification: (id: string) =>
    http.post<Notification>(`/notifications/${id}/unpin`),

  getPinnedNotifications: () =>
    http.get<Notification[]>('/notifications/pinned'),

  getNotificationSettings: () =>
    http.get<{
      pushEnabled: boolean;
      emailEnabled: boolean;
      smsEnabled: boolean;
      byType: Record<string, { push: boolean; email: boolean; sms: boolean }>;
    }>('/notifications/settings'),

  updateNotificationSettings: (settings: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    byType?: Record<string, { push?: boolean; email?: boolean; sms?: boolean }>;
  }) => http.put<void>('/notifications/settings', settings),

  getNotificationTypes: () =>
    http.get<Array<{ type: string; name: string; description: string; category: string }>>(
      '/notifications/types'
    ),
};

export default notificationApi;
