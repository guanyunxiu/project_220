import { http } from '@/utils/request';
import type {
  Work,
  Volume,
  Chapter,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface CreateWorkDto {
  title: string;
  type: string;
  description?: string;
  cover?: string;
  categories?: string;
  tags?: string;
  audience?: string;
  language?: string;
  isOriginal?: boolean;
  isPremium?: boolean;
}

export interface UpdateWorkDto {
  title?: string;
  description?: string;
  cover?: string;
  banner?: string;
  categories?: string;
  tags?: string;
  status?: string;
  audience?: string;
  language?: string;
  isOriginal?: boolean;
  isPremium?: boolean;
  allowComments?: boolean;
}

export interface CreateVolumeDto {
  title: string;
  order?: number;
  description?: string;
  cover?: string;
}

export interface UpdateVolumeDto {
  title?: string;
  order?: number;
  description?: string;
  cover?: string;
  status?: string;
  isVisible?: boolean;
}

export const workApi = {
  getWorks: (params?: PaginationParams & { type?: string; status?: string; category?: string; tag?: string }) =>
    http.get<PaginatedResponse<Work>>('/works', { params }),

  getFeaturedWorks: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Work>>('/works/featured', { params }),

  getRecommendedWorks: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Work>>('/works/recommended', { params }),

  getHotWorks: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Work>>('/works/hot', { params }),

  getLatestWorks: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Work>>('/works/latest', { params }),

  getCompletedWorks: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Work>>('/works/completed', { params }),

  getWorkById: (id: string) =>
    http.get<Work>(`/works/${id}`),

  getWorkBySlug: (slug: string) =>
    http.get<Work>(`/works/slug/${slug}`),

  createWork: (data: CreateWorkDto) =>
    http.post<Work>('/works', data),

  updateWork: (id: string, data: UpdateWorkDto) =>
    http.put<Work>(`/works/${id}`, data),

  deleteWork: (id: string) =>
    http.delete<void>(`/works/${id}`),

  publishWork: (id: string) =>
    http.post<Work>(`/works/${id}/publish`),

  getWorkVolumes: (workId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Volume>>(`/works/${workId}/volumes`, { params }),

  createVolume: (workId: string, data: CreateVolumeDto) =>
    http.post<Volume>(`/works/${workId}/volumes`, data),

  updateVolume: (workId: string, volumeId: string, data: UpdateVolumeDto) =>
    http.put<Volume>(`/works/${workId}/volumes/${volumeId}`, data),

  deleteVolume: (workId: string, volumeId: string) =>
    http.delete<void>(`/works/${workId}/volumes/${volumeId}`),

  getWorkChapters: (workId: string, params?: PaginationParams & { volumeId?: string }) =>
    http.get<PaginatedResponse<Chapter>>(`/works/${workId}/chapters`, { params }),

  addFavorite: (workId: string) =>
    http.post<void>(`/works/${workId}/favorite`),

  removeFavorite: (workId: string) =>
    http.delete<void>(`/works/${workId}/favorite`),

  checkFavorite: (workId: string) =>
    http.get<boolean>(`/works/${workId}/favorite`),

  addSubscription: (workId: string) =>
    http.post<void>(`/works/${workId}/subscribe`),

  removeSubscription: (workId: string) =>
    http.delete<void>(`/works/${workId}/subscribe`),

  checkSubscription: (workId: string) =>
    http.get<boolean>(`/works/${workId}/subscribe`),

  rateWork: (workId: string, rating: number) =>
    http.post<Work>(`/works/${workId}/rate`, { rating }),

  incrementViews: (workId: string) =>
    http.post<void>(`/works/${workId}/view`),

  getCategories: () =>
    http.get<string[]>('/works/categories'),

  getTags: (keyword?: string) =>
    http.get<string[]>('/works/tags', { params: { keyword } }),
};

export default workApi;
