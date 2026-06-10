import { http } from '@/utils/request';
import type {
  User,
  LoginResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface UpdateUserDto {
  nickname?: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export const userApi = {
  login: (data: LoginDto) =>
    http.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterDto) =>
    http.post<User>('/auth/register', data),

  logout: () =>
    http.post<void>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    http.post<LoginResponse>('/auth/refresh', { refreshToken }),

  sendResetPasswordCode: (email: string) =>
    http.post<void>('/auth/forgot-password', { email }),

  resetPassword: (data: ResetPasswordDto) =>
    http.post<void>('/auth/reset-password', data),

  sendEmailVerification: () =>
    http.post<void>('/users/verify-email/send'),

  verifyEmail: (code: string) =>
    http.post<void>('/users/verify-email', { code }),

  getCurrentUser: () =>
    http.get<User>('/users/me'),

  updateProfile: (data: UpdateUserDto) =>
    http.put<User>('/users/me', data),

  changePassword: (data: ChangePasswordDto) =>
    http.put<void>('/users/me/password', data),

  uploadAvatar: (formData: FormData) =>
    http.post<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUserById: (id: string) =>
    http.get<User>(`/users/${id}`),

  getUserByUsername: (username: string) =>
    http.get<User>(`/users/username/${username}`),

  getUserWorks: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<any>>(`/users/${userId}/works`, { params }),

  getUserFavorites: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<any>>(`/users/${userId}/favorites`, { params }),

  getUserSubscriptions: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<any>>(`/users/${userId}/subscriptions`, { params }),

  followUser: (userId: string) =>
    http.post<void>(`/users/${userId}/follow`),

  unfollowUser: (userId: string) =>
    http.delete<void>(`/users/${userId}/follow`),

  getFollowers: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<User>>(`/users/${userId}/followers`, { params }),

  getFollowing: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<User>>(`/users/${userId}/following`, { params }),
};

export default userApi;
