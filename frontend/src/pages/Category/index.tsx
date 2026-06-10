import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Tag, Row, Col, Pagination, Button, Empty, Select, Space, Segmented } from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FilterOutlined,
  BookOutlined,
  FireFilled,
  TrophyOutlined,
  RocketOutlined,
  CrownOutlined,
  HeartOutlined,
  PictureOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import WorkCard, { Work } from '../../components/WorkCard';

interface Category {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const categories: Category[] = [
  { key: 'all', name: '全部', icon: <BookOutlined />, color: 'text-gray-600', count: 12580 },
  { key: 'xuanhuan', name: '玄幻奇幻', icon: <FireFilled />, color: 'text-red-500', count: 3280 },
  { key: 'xianxia', name: '武侠仙侠', icon: <CrownOutlined />, color: 'text-blue-500', count: 2560 },
  { key: 'dushi', name: '都市言情', icon: <HeartOutlined />, color: 'text-pink-500', count: 2150 },
  { key: 'lishi', name: '历史军事', icon: <TrophyOutlined />, color: 'text-amber-600', count: 1420 },
  { key: 'kehuan', name: '科幻游戏', icon: <RocketOutlined />, color: 'text-cyan-500', count: 980 },
  { key: 'xuanyi', name: '悬疑灵异', icon: <MessageOutlined />, color: 'text-purple-500', count: 760 },
  { key: 'erciyuan', name: '二次元', icon: <StarOutlined />, color: 'text-orange-400', count: 650 },
  { key: 'manhua', name: '漫画', icon: <PictureOutlined />, color: 'text-green-500', count: 480 },
  { key: 'tongren', name: '同人衍生', icon: <TeamOutlined />, color: 'text-indigo-500', count: 300 },
];

const subCategories: Record<string, string[]> = {
  all: [],
  xuanhuan: ['东方玄幻', '异世大陆', '高武世界', '剑与魔法', '史诗奇幻'],
  xianxia: ['古典仙侠', '修真文明', '现代修真', '幻想修仙', '神话修真'],
  dushi: ['都市生活', '都市异能', '青春校园', '职场丽人', '豪门总裁'],
  lishi: ['上古先秦', '秦汉三国', '两晋隋唐', '五代十国', '历史传记'],
  kehuan: ['末世危机', '未来世界', '星际文明', '游戏异界', '科幻空间'],
  xuanyi: ['诡秘悬疑', '探险生存', '灵异鬼怪', '推理侦探', '恐怖惊悚'],
  erciyuan: ['衍生同人', '原生幻想', '轻小说', '搞笑吐槽', '恋爱日常'],
  manhua: ['热血', '恋爱', '冒险', '校园', '搞笑', '奇幻'],
  tongren: ['动漫同人', '影视同人', '小说同人', '游戏同人', '明星同人'],
};

const generateWorks = (category: string, count: number): Work[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1 + Math.random() * 10000,
    title: `${categories.find((c) => c.key === category)?.name || '分类'}精品${i + 1}号作品`,
    cover: `https://picsum.photos/seed/cat${category}${i}/300/400`,
    author: ['辰东', '会说话的肘子', '我吃西红柿', '唐家三少', '天蚕土豆'][i % 5],
    category: categories.find((c) => c.key === category)?.name || '玄幻奇幻',
    tags: ['爽文', '穿越', '系统', '升级', '热血'].slice(0, (i % 3) + 2),
    status: i % 3 === 0 ? 'completed' : 'ongoing',
    rating: 8 + Math.random() * 2,
    views: Math.floor(Math.random() * 2000000) + 100000,
    likes: Math.floor(Math.random() * 100000) + 5000,
    favorites: Math.floor(Math.random() * 50000) + 2000,
    words: Math.floor(Math.random() * 5000000) + 100000,
    lastChapter: `第${Math.floor(Math.random() * 1000)}章 最新章节`,
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: '这是一部非常精彩的小说，强烈推荐！',
  }));
};

export default function Category() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState(id || 'all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('hot');
  const [status, setStatus] = useState<string>('all');
  const [words, setWords] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const works = generateWorks(activeCategory, 50);
  const filtered = works
    .filter((w) => (status === 'all' ? true : w.status === status))
    .filter((w) => {
      if (words === 'all') return true;
      const [min, max] = words.split('-').map(Number);
      if (min && w.words < min * 10000) return false;
      if (max && w.words > max * 10000) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'hot':
          return b.views - a.views;
        case 'new':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'words':
          return b.words - a.words;
        case 'complete':
          return b.status === 'completed' ? 1 : -1;
        default:
          return 0;
      }
    });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const currentCategory = categories.find((c) => c.key === activeCategory);
  const subs = subCategories[activeCategory] || [];

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className={`p-6 bg-gradient-to-r ${
          activeCategory === 'all'
            ? 'from-gray-600 to-gray-800'
            : activeCategory === 'xuanhuan'
            ? 'from-red-500 to-orange-500'
            : activeCategory === 'xianxia'
            ? 'from-blue-500 to-cyan-500'
            : activeCategory === 'dushi'
            ? 'from-pink-500 to-rose-500'
            : activeCategory === 'lishi'
            ? 'from-amber-500 to-yellow-500'
            : activeCategory === 'kehuan'
            ? 'from-cyan-500 to-blue-500'
            : activeCategory === 'xuanyi'
            ? 'from-purple-500 to-indigo-500'
            : activeCategory === 'erciyuan'
            ? 'from-orange-400 to-pink-400'
            : activeCategory === 'manhua'
            ? 'from-green-500 to-emerald-500'
            : 'from-indigo-500 to-purple-500'
        } text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{currentCategory?.icon}</span>
            <h1 className="text-2xl font-bold">{currentCategory?.name}</h1>
            <Tag color="white" className="!text-black/70 !m-0">
              {currentCategory?.count.toLocaleString()} 部作品
            </Tag>
          </div>
          <p className="text-sm opacity-90">探索{currentCategory?.name}分类下的精彩作品</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            to={cat.key === 'all' ? '/category' : `/category/${cat.key}`}
            onClick={() => {
              setActiveCategory(cat.key);
              setActiveSubCategory('all');
              setPage(1);
            }}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              activeCategory === cat.key
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-primary-200'
            }`}
          >
            <div className={`text-2xl mb-1 ${cat.color}`}>{cat.icon}</div>
            <div className="font-medium text-gray-800 text-sm">{cat.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{cat.count.toLocaleString()}部</div>
          </Link>
        ))}
      </div>

      {subs.length > 0 && (
        <Card className="!rounded-2xl">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-600 shrink-0">子分类：</span>
            <Button
              type={activeSubCategory === 'all' ? 'primary' : 'default'}
              size="small"
              onClick={() => {
                setActiveSubCategory('all');
                setPage(1);
              }}
            >
              全部
            </Button>
            {subs.map((sub) => (
              <Button
                key={sub}
                type={activeSubCategory === sub ? 'primary' : 'default'}
                size="small"
                onClick={() => {
                  setActiveSubCategory(sub);
                  setPage(1);
                }}
              >
                {sub}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Card className="!rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Space wrap>
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <FilterOutlined />
              筛选：
            </span>
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              style={{ width: 100 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'ongoing', label: '连载中' },
                { value: 'completed', label: '已完结' },
              ]}
            />
            <Select
              value={words}
              onChange={(v) => {
                setWords(v);
                setPage(1);
              }}
              style={{ width: 130 }}
              options={[
                { value: 'all', label: '全部字数' },
                { value: '0-30', label: '30万字以下' },
                { value: '30-100', label: '30-100万字' },
                { value: '100-200', label: '100-200万字' },
                { value: '200-99999', label: '200万字以上' },
              ]}
            />
          </Space>

          <Segmented
            value={sortBy}
            onChange={(v) => {
              setSortBy(String(v));
              setPage(1);
            }}
            options={[
              { value: 'hot', label: <span className="flex items-center gap-1"><FireOutlined /> 人气</span> },
              { value: 'new', label: <span className="flex items-center gap-1"><ClockCircleOutlined /> 最新</span> },
              { value: 'rating', label: <span className="flex items-center gap-1"><StarOutlined /> 评分</span> },
              { value: 'words', label: <span className="flex items-center gap-1"><BookOutlined /> 字数</span> },
              { value: 'complete', label: <span className="flex items-center gap-1"><TrophyOutlined /> 完结</span> },
            ]}
          />
        </div>

        {paginated.length === 0 ? (
          <Empty description="暂无符合条件的作品" className="py-16" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginated.map((work) => (
                <Col xs={12} sm={8} md={6} lg={5} xl={4} key={work.id}>
                  <WorkCard work={work} />
                </Col>
              ))}
            </Row>

            <div className="flex justify-center mt-10">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filtered.length}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(t) => `共 ${t} 部作品`}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
