import { http } from '@/utils/request';
import type {
  Work,
  User,
  Chapter,
  PaginationParams,
} from '@/types';

export interface SearchParams extends PaginationParams {
  type?: 'all' | 'work' | 'user' | 'chapter';
  category?: string;
  tags?: string[];
  workType?: string;
  status?: string;
  audience?: string;
  minRating?: number;
  minWords?: number;
  maxWords?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular' | 'rating' | 'words' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  works?: { items: Work[]; total: number };
  users?: { items: User[]; total: number };
  chapters?: { items: Chapter[]; total: number };
  suggestions?: string[];
}

export const searchApi = {
  search: (keyword: string, params?: SearchParams) =>
    http.get<SearchResult>('/search', {
      params: {
        keyword,
        ...params,
        tags: params?.tags?.join(','),
      },
    }),

  searchWorks: (keyword: string, params?: Omit<SearchParams, 'type'>) =>
    http.get<{ items: Work[]; total: number; page: number; limit: number; totalPages: number }>(
      '/search/works',
      {
        params: {
          keyword,
          ...params,
          tags: params?.tags?.join(','),
        },
      }
    ),

  searchUsers: (keyword: string, params?: Omit<SearchParams, 'type'>) =>
    http.get<{ items: User[]; total: number; page: number; limit: number; totalPages: number }>(
      '/search/users',
      { params: { keyword, ...params } }
    ),

  searchChapters: (keyword: string, params?: Omit<SearchParams, 'type'> & { workId?: string }) =>
    http.get<{ items: Chapter[]; total: number; page: number; limit: number; totalPages: number }>(
      '/search/chapters',
      { params: { keyword, ...params } }
    ),

  getSuggestions: (keyword: string, limit?: number) =>
    http.get<string[]>('/search/suggestions', {
      params: { keyword, limit },
    }),

  getHotKeywords: (limit?: number) =>
    http.get<Array<{ keyword: string; count: number; trend: number }>>('/search/hot', {
      params: { limit },
    }),

  getRecentSearches: () =>
    http.get<string[]>('/search/recent'),

  clearRecentSearches: () =>
    http.delete<void>('/search/recent'),

  addToSearchHistory: (keyword: string) =>
    http.post<void>('/search/history', { keyword }),

  getSearchHistory: (limit?: number) =>
    http.get<Array<{ keyword: string; searchedAt: Date }>>('/search/history', {
      params: { limit },
    }),

  clearSearchHistory: () =>
    http.delete<void>('/search/history'),

  deleteSearchHistory: (id: string) =>
    http.delete<void>(`/search/history/${id}`),

  getTrending: (timeRange?: 'day' | 'week' | 'month' | 'year', limit?: number) =>
    http.get<{ works: Work[]; keywords: Array<{ keyword: string; count: number }> }>(
      '/search/trending',
      { params: { timeRange, limit } }
    ),

  getRelatedWorks: (workId: string, limit?: number) =>
    http.get<Work[]>('/search/related', {
      params: { workId, limit },
    }),
};

export default searchApi;
