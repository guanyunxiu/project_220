import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import type { ApiResponse } from '@/types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const handleError = (error: AxiosError<ApiResponse<any>>) => {
  const status = error.response?.status;
  const data = error.response?.data;

  switch (status) {
    case 401:
      clearTokens();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      break;
    case 403:
      console.error('权限不足:', data?.message);
      break;
    case 404:
      console.error('资源不存在:', data?.message);
      break;
    case 500:
      console.error('服务器错误:', data?.message);
      break;
    default:
      console.error('请求错误:', data?.message || error.message);
  }

  return Promise.reject(error);
};

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const { data } = response;
    if (data && data.code === 200) {
      return data;
    }
    return Promise.reject(new Error(data?.message || '请求失败'));
  },
  (error: AxiosError<ApiResponse<any>>) => {
    return handleError(error);
  }
);

export interface RequestConfig extends AxiosRequestConfig {}

export const http = {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request.get(url, config);
  },
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return request.post(url, data, config);
  },
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return request.put(url, data, config);
  },
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return request.patch(url, data, config);
  },
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return request.delete(url, config);
  },
};

export default request;
