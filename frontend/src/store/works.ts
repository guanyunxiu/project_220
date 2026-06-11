import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkStatus = 'draft' | 'ongoing' | 'completed' | 'pending' | 'rejected' | 'published' | 'hiatus' | 'banned';
export type WorkType = 'novel' | 'comic';

export interface SharedWork {
  id: number;
  title: string;
  cover: string;
  category: string;
  type?: WorkType;
  tags: string[];
  status: WorkStatus;
  auditStatus: 'pending' | 'approved' | 'rejected';
  author: string;
  authorId: number;
  words: number;
  chapters: number;
  views: number;
  favorites: number;
  likes: number;
  income: number;
  rating: number;
  updatedAt: string;
  createdAt: string;
  progress: number;
  description?: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
}

interface WorksStoreState {
  works: SharedWork[];
  addWork: (work: Omit<SharedWork, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'chapters' | 'words' | 'favorites' | 'likes' | 'income' | 'rating' | 'progress'>) => SharedWork;
  updateWork: (id: number, patch: Partial<SharedWork>) => void;
  deleteWork: (id: number) => void;
  getWorksByAuthor: (authorId: number) => SharedWork[];
  getWorksByStatus: (status?: WorkStatus) => SharedWork[];
  getWorksByAuditStatus: (auditStatus?: 'pending' | 'approved' | 'rejected') => SharedWork[];
  getPendingCount: () => number;
  approveWork: (id: number) => void;
  rejectWork: (id: number) => void;
}

const initialWorks: SharedWork[] = [
  {
    id: 1,
    title: '星辰大海的冒险',
    cover: 'https://picsum.photos/seed/work1/300/400',
    category: '科幻,冒险',
    type: 'novel',
    tags: ['爽文', '穿越'],
    status: 'ongoing',
    auditStatus: 'approved',
    author: '张三',
    authorId: 1001,
    words: 1250000,
    chapters: 156,
    views: 125678,
    favorites: 34567,
    likes: 3456,
    income: 25800,
    rating: 9.2,
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    progress: 80,
    description: '这是一部关于宇宙与命运的史诗巨作，讲述了主角从普通少年成长为星际英雄的传奇故事。',
    isFeatured: true,
    isRecommended: false,
  },
  {
    id: 2,
    title: '都市修仙传说',
    cover: 'https://picsum.photos/seed/work2/300/400',
    category: '都市,修仙',
    type: 'novel',
    tags: ['系统', '重生'],
    status: 'ongoing',
    auditStatus: 'approved',
    author: '李四',
    authorId: 1002,
    words: 2890000,
    chapters: 289,
    views: 98765,
    favorites: 28900,
    likes: 2890,
    income: 42300,
    rating: 8.8,
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    progress: 70,
    description: '修仙者回归都市，开启不一样的都市传奇！',
    isFeatured: false,
    isRecommended: true,
  },
  {
    id: 3,
    title: '异世界召唤',
    cover: 'https://picsum.photos/seed/work3/300/400',
    category: '异世界,奇幻',
    type: 'comic',
    tags: ['穿越', '战斗'],
    status: 'ongoing',
    auditStatus: 'approved',
    author: '王五',
    authorId: 1003,
    words: 450000,
    chapters: 45,
    views: 87654,
    favorites: 24560,
    likes: 2456,
    income: 18600,
    rating: 9.0,
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    progress: 45,
    description: '普通高中生被召唤到异世界，竟然成为了勇者！',
    isFeatured: false,
    isRecommended: false,
  },
  {
    id: 4,
    title: '重生之巅峰',
    cover: 'https://picsum.photos/seed/work4/300/400',
    category: '重生,都市',
    type: 'novel',
    tags: ['重生', '商战'],
    status: 'completed',
    auditStatus: 'approved',
    author: '赵六',
    authorId: 1004,
    words: 5000000,
    chapters: 500,
    views: 568000,
    favorites: 120000,
    likes: 20000,
    income: 185000,
    rating: 9.8,
    updatedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    progress: 100,
    description: '商业巨子回到2000年，重新打造属于他的商业帝国！',
    isFeatured: true,
    isRecommended: true,
  },
  {
    id: 5,
    title: '末世求生记',
    cover: 'https://picsum.photos/seed/work5/300/400',
    category: '末世,生存',
    type: 'comic',
    tags: ['末世', '系统'],
    status: 'ongoing',
    auditStatus: 'approved',
    author: '钱七',
    authorId: 1005,
    words: 780000,
    chapters: 78,
    views: 65432,
    favorites: 18900,
    likes: 1890,
    income: 12300,
    rating: 8.5,
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    progress: 60,
    description: '末世降临，丧尸横行，主角带着金手指艰难求生！',
    isFeatured: false,
    isRecommended: false,
  },
];

export const useWorksStore = create<WorksStoreState>()(
  persist(
    (set, get) => ({
      works: initialWorks,

      addWork: (work) => {
        const newWork: SharedWork = {
          ...work,
          id: Date.now(),
          views: 0,
          chapters: 0,
          words: 0,
          favorites: 0,
          likes: 0,
          income: 0,
          rating: 0,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ works: [newWork, ...state.works] }));
        return newWork;
      },

      updateWork: (id, patch) =>
        set((state) => ({
          works: state.works.map((w) =>
            w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w
          ),
        })),

      deleteWork: (id) =>
        set((state) => ({ works: state.works.filter((w) => w.id !== id) })),

      getWorksByAuthor: (authorId) =>
        get().works.filter((w) => w.authorId === authorId),

      getWorksByStatus: (status) =>
        status ? get().works.filter((w) => w.status === status) : get().works,

      getWorksByAuditStatus: (auditStatus) =>
        auditStatus ? get().works.filter((w) => w.auditStatus === auditStatus) : get().works,

      getPendingCount: () =>
        get().works.filter((w) => w.auditStatus === 'pending').length,

      approveWork: (id) =>
        set((state) => ({
          works: state.works.map((w) =>
            w.id === id
              ? { ...w, auditStatus: 'approved', status: 'ongoing', updatedAt: new Date().toISOString() }
              : w
          ),
        })),

      rejectWork: (id) =>
        set((state) => ({
          works: state.works.map((w) =>
            w.id === id
              ? { ...w, auditStatus: 'rejected', status: 'draft', updatedAt: new Date().toISOString() }
              : w
          ),
        })),
    }),
    {
      name: 'works-store',
    }
  )
);
