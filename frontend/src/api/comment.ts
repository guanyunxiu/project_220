import { http } from '@/utils/request';
import type {
  Comment,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface CreateCommentDto {
  workId: string;
  chapterId?: string;
  content: string;
  parentId?: string;
  replyToUserId?: string;
  isSpoiler?: boolean;
}

export interface UpdateCommentDto {
  content: string;
  isSpoiler?: boolean;
}

export const commentApi = {
  getWorkComments: (workId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Comment>>(`/comments/work/${workId}`, { params }),

  getChapterComments: (chapterId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Comment>>(`/comments/chapter/${chapterId}`, { params }),

  getCommentReplies: (commentId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, { params }),

  getCommentById: (id: string) =>
    http.get<Comment>(`/comments/${id}`),

  createComment: (data: CreateCommentDto) =>
    http.post<Comment>('/comments', data),

  updateComment: (id: string, data: UpdateCommentDto) =>
    http.put<Comment>(`/comments/${id}`, data),

  deleteComment: (id: string) =>
    http.delete<void>(`/comments/${id}`),

  likeComment: (id: string) =>
    http.post<void>(`/comments/${id}/like`),

  unlikeComment: (id: string) =>
    http.delete<void>(`/comments/${id}/like`),

  dislikeComment: (id: string) =>
    http.post<void>(`/comments/${id}/dislike`),

  undislikeComment: (id: string) =>
    http.delete<void>(`/comments/${id}/dislike`),

  pinComment: (id: string) =>
    http.post<Comment>(`/comments/${id}/pin`),

  unpinComment: (id: string) =>
    http.post<Comment>(`/comments/${id}/unpin`),

  reportComment: (id: string, reason: string) =>
    http.post<void>(`/comments/${id}/report`, { reason }),

  getUserComments: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Comment>>(`/comments/user/${userId}`, { params }),

  getMyComments: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Comment>>('/comments/mine', { params }),
};

export default commentApi;
