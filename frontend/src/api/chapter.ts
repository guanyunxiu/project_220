import { http } from '@/utils/request';
import type {
  Chapter,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface CreateChapterDto {
  title: string;
  volumeId?: string;
  order?: number;
  summary?: string;
  content?: string;
  contentHtml?: string;
  images?: any;
  thumbnail?: string;
  access?: string;
  price?: number;
  allowComments?: boolean;
  isNsfw?: boolean;
  scheduledAt?: Date;
}

export interface UpdateChapterDto {
  title?: string;
  volumeId?: string;
  order?: number;
  summary?: string;
  content?: string;
  contentHtml?: string;
  images?: any;
  thumbnail?: string;
  status?: string;
  access?: string;
  price?: number;
  allowComments?: boolean;
  isNsfw?: boolean;
  scheduledAt?: Date;
  sourceUrl?: string;
  translator?: string;
  editor?: string;
}

export interface MoveChapterDto {
  volumeId?: string;
  order: number;
}

export const chapterApi = {
  getChapterById: (id: string) =>
    http.get<Chapter>(`/chapters/${id}`),

  getChapterBySlug: (workId: string, slug: string) =>
    http.get<Chapter>(`/chapters/by-slug`, { params: { workId, slug } }),

  createChapter: (workId: string, data: CreateChapterDto) =>
    http.post<Chapter>(`/chapters`, { workId, ...data }),

  updateChapter: (id: string, data: UpdateChapterDto) =>
    http.put<Chapter>(`/chapters/${id}`, data),

  deleteChapter: (id: string) =>
    http.delete<void>(`/chapters/${id}`),

  publishChapter: (id: string) =>
    http.post<Chapter>(`/chapters/${id}/publish`),

  batchPublish: (ids: string[]) =>
    http.post<void>(`/chapters/batch-publish`, { ids }),

  batchDelete: (ids: string[]) =>
    http.post<void>(`/chapters/batch-delete`, { ids }),

  moveChapter: (id: string, data: MoveChapterDto) =>
    http.post<Chapter>(`/chapters/${id}/move`, data),

  getPrevChapter: (id: string) =>
    http.get<Chapter | null>(`/chapters/${id}/prev`),

  getNextChapter: (id: string) =>
    http.get<Chapter | null>(`/chapters/${id}/next`),

  unlockChapter: (id: string) =>
    http.post<Chapter>(`/chapters/${id}/unlock`),

  likeChapter: (id: string) =>
    http.post<void>(`/chapters/${id}/like`),

  unlikeChapter: (id: string) =>
    http.delete<void>(`/chapters/${id}/like`),

  checkLike: (id: string) =>
    http.get<boolean>(`/chapters/${id}/like`),

  incrementViews: (id: string) =>
    http.post<void>(`/chapters/${id}/view`),

  getDrafts: (params?: PaginationParams & { workId?: string }) =>
    http.get<PaginatedResponse<Chapter>>('/chapters/drafts', { params }),

  getScheduled: (params?: PaginationParams & { workId?: string }) =>
    http.get<PaginatedResponse<Chapter>>('/chapters/scheduled', { params }),

  getReadingHistory: (params?: PaginationParams) =>
    http.get<PaginatedResponse<{ chapter: Chapter; progress: number; lastReadAt: Date }>>(
      '/chapters/reading-history',
      { params }
    ),

  addToReadingHistory: (chapterId: string, progress?: number) =>
    http.post<void>('/chapters/reading-history', { chapterId, progress }),

  updateReadingProgress: (chapterId: string, progress: number) =>
    http.put<void>(`/chapters/reading-history/${chapterId}`, { progress }),

  removeFromReadingHistory: (chapterId: string) =>
    http.delete<void>(`/chapters/reading-history/${chapterId}`),

  clearReadingHistory: () =>
    http.delete<void>('/chapters/reading-history'),
};

export default chapterApi;
