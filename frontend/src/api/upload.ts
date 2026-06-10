import { http } from '@/utils/request';
import type { UploadFile } from '@/types';

export interface UploadParams {
  folder?: string;
  storageType?: string;
}

export const uploadApi = {
  uploadFile: (file: File, params?: UploadParams) => {
    const formData = new FormData();
    formData.append('file', file);
    if (params?.folder) formData.append('folder', params.folder);
    if (params?.storageType) formData.append('storageType', params.storageType);
    return http.post<UploadFile>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadFiles: (files: File[], params?: UploadParams) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (params?.folder) formData.append('folder', params.folder);
    if (params?.storageType) formData.append('storageType', params.storageType);
    return http.post<UploadFile[]>('/upload/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImage: (file: File, params?: UploadParams & { maxWidth?: number; maxHeight?: number; quality?: number }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (params?.folder) formData.append('folder', params.folder);
    if (params?.storageType) formData.append('storageType', params.storageType);
    if (params?.maxWidth) formData.append('maxWidth', String(params.maxWidth));
    if (params?.maxHeight) formData.append('maxHeight', String(params.maxHeight));
    if (params?.quality) formData.append('quality', String(params.quality));
    return http.post<UploadFile>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImages: (files: File[], params?: UploadParams) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (params?.folder) formData.append('folder', params.folder);
    if (params?.storageType) formData.append('storageType', params.storageType);
    return http.post<UploadFile[]>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadCover: (file: File, workId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workId) formData.append('workId', workId);
    return http.post<UploadFile>('/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadBanner: (file: File, workId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workId) formData.append('workId', workId);
    return http.post<UploadFile>('/upload/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<UploadFile>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadChapterImage: (file: File, workId?: string, chapterId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workId) formData.append('workId', workId);
    if (chapterId) formData.append('chapterId', chapterId);
    return http.post<UploadFile>('/upload/chapter-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadByUrl: (url: string, params?: UploadParams) =>
    http.post<UploadFile>('/upload/url', { url, ...params }),

  deleteFile: (id: string) =>
    http.delete<void>(`/upload/file/${id}`),

  deleteFiles: (ids: string[]) =>
    http.post<void>('/upload/files', { ids }),

  getFileInfo: (id: string) =>
    http.get<UploadFile>(`/upload/file/${id}`),

  getMyFiles: (params?: { page?: number; limit?: number; folder?: string; type?: string }) =>
    http.get<{ items: UploadFile[]; total: number; page: number; limit: number }>(
      '/upload/my-files',
      { params }
    ),

  getFolders: () =>
    http.get<string[]>('/upload/folders'),

  createFolder: (name: string, parentFolder?: string) =>
    http.post<string>('/upload/folder', { name, parentFolder }),

  deleteFolder: (name: string) =>
    http.delete<void>(`/upload/folder`, { params: { name } }),

  getUploadConfig: () =>
    http.get<{
      maxFileSize: number;
      allowedTypes: string[];
      allowedImageTypes: string[];
      chunkSize: number;
      storageType: string;
    }>('/upload/config'),

  getPresignedUrl: (filename: string, contentType?: string) =>
    http.get<{ url: string; key: string; expiresAt: Date }>('/upload/presigned', {
      params: { filename, contentType },
    }),
};

export default uploadApi;
