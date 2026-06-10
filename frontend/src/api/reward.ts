import { http } from '@/utils/request';
import type {
  Reward,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export interface CreateRewardDto {
  workId: string;
  chapterId?: string;
  amount: number;
  giftType?: string;
  giftQuantity?: number;
  isAnonymous?: boolean;
  message?: string;
}

export interface PayRewardDto {
  rewardId: string;
  paymentMethod: string;
}

export const rewardApi = {
  getWorkRewards: (workId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>(`/rewards/work/${workId}`, { params }),

  getChapterRewards: (chapterId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>(`/rewards/chapter/${chapterId}`, { params }),

  getUserRewards: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>(`/rewards/user/${userId}`, { params }),

  getUserReceivedRewards: (userId: string, params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>(`/rewards/received/${userId}`, { params }),

  getRewardById: (id: string) =>
    http.get<Reward>(`/rewards/${id}`),

  createReward: (data: CreateRewardDto) =>
    http.post<Reward>('/rewards', data),

  payReward: (data: PayRewardDto) =>
    http.post<Reward>('/rewards/pay', data),

  cancelReward: (id: string) =>
    http.post<void>(`/rewards/${id}/cancel`),

  getMyRewards: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>('/rewards/mine', { params }),

  getMyReceivedRewards: (params?: PaginationParams) =>
    http.get<PaginatedResponse<Reward>>('/rewards/mine/received', { params }),

  getRewardLeaderboard: (workId?: string, limit?: number) =>
    http.get<Array<{ user: any; totalAmount: number; count: number }>>(
      '/rewards/leaderboard',
      { params: { workId, limit } }
    ),

  getGiftList: () =>
    http.get<Array<{ id: string; name: string; icon: string; price: number; description: string }>>(
      '/rewards/gifts'
    ),

  getBalance: () =>
    http.get<{ balance: number; frozen: number; totalEarned: number; totalWithdrawn: number }>(
      '/rewards/balance'
    ),

  withdraw: (amount: number, paymentMethod: string, account: string) =>
    http.post<void>('/rewards/withdraw', { amount, paymentMethod, account }),

  getWithdrawHistory: (params?: PaginationParams) =>
    http.get<PaginatedResponse<any>>('/rewards/withdraw/history', { params }),

  getPaymentMethods: () =>
    http.get<Array<{ id: string; name: string; icon: string; type: string; enabled: boolean }>>(
      '/rewards/payment-methods'
    ),
};

export default rewardApi;
