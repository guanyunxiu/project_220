export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  totalReads: number;
  totalWorks: number;
  totalFollowers: number;
  totalFollowing: number;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export enum WorkType {
  NOVEL = 'novel',
  COMIC = 'comic',
}

export enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
  BANNED = 'banned',
}

export enum WorkAudience {
  ALL = 'all',
  TEEN = 'teen',
  ADULT = 'adult',
}

export interface Work {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  cover?: string;
  banner?: string;
  description?: string;
  type: WorkType;
  status: WorkStatus;
  audience: WorkAudience;
  categories?: string;
  tags?: string;
  language?: string;
  isOriginal: boolean;
  isPremium: boolean;
  allowComments: boolean;
  isFeatured: boolean;
  isRecommended: boolean;
  totalVolumes: number;
  totalChapters: number;
  totalWords: number;
  totalViews: number;
  uniqueViews: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
  totalSubscriptions: number;
  totalRewards: number;
  totalRewardAmount: number;
  rating: number;
  ratingCount: number;
  hotScore: number;
  publishedAt?: Date;
  lastUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export enum VolumeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}

export interface Volume {
  id: string;
  workId: string;
  order: number;
  title: string;
  slug?: string;
  cover?: string;
  description?: string;
  status: VolumeStatus;
  isVisible: boolean;
  totalChapters: number;
  totalWords: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
}

export enum ChapterStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  BANNED = 'banned',
}

export enum ChapterAccess {
  FREE = 'free',
  LOCKED = 'locked',
  PREMIUM = 'premium',
}

export interface Chapter {
  id: string;
  workId: string;
  volumeId?: string;
  order: number;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  contentHtml?: string;
  images?: any;
  thumbnail?: string;
  status: ChapterStatus;
  access: ChapterAccess;
  price: number;
  wordCount: number;
  views: number;
  uniqueViews: number;
  likes: number;
  commentsCount: number;
  allowComments: boolean;
  isNsfw: boolean;
  sourceUrl?: string;
  translator?: string;
  editor?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  prevChapterId?: string;
  nextChapterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
  DELETED = 'deleted',
}

export interface Comment {
  id: string;
  userId: string;
  workId: string;
  chapterId?: string;
  parentId?: string;
  replyToUserId?: string;
  content: string;
  status: CommentStatus;
  likes: number;
  dislikes: number;
  repliesCount: number;
  isPinned: boolean;
  isSpoiler: boolean;
  isEdited: boolean;
  ipAddress?: string;
  userAgent?: string;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  replies?: Comment[];
}

export enum RewardStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Reward {
  id: string;
  userId: string;
  workId: string;
  chapterId?: string;
  amount: number;
  currency: string;
  orderId?: string;
  paymentMethod?: string;
  transactionId?: string;
  status: RewardStatus;
  giftType?: string;
  giftQuantity: number;
  isAnonymous: boolean;
  message?: string;
  ipAddress?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  work?: Work;
}

export enum NotificationType {
  SYSTEM = 'system',
  COMMENT = 'comment',
  LIKE = 'like',
  FOLLOW = 'follow',
  SUBSCRIPTION = 'subscription',
  REWARD = 'reward',
  CHAPTER_UPDATE = 'chapter_update',
  MENTION = 'mention',
  REPORT = 'report',
  NEWS = 'news',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  data?: any;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  workId: string;
  createdAt: Date;
  work?: Work;
}

export interface Subscription {
  id: string;
  userId: string;
  workId: string;
  createdAt: Date;
  work?: Work;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  workId: string;
  chapterId: string;
  progress: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Draft {
  id: string;
  authorId: string;
  workId?: string;
  chapterId?: string;
  title: string;
  content?: string;
  contentHtml?: string;
  autoSavedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface UploadFile {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  storageType: string;
  createdAt: Date;
}
