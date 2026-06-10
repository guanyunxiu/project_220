import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Input,
  Select,
  Tag,
  Empty,
  Pagination,
  Row,
  Col,
  Card,
  Button,
  Space,
  Tooltip,
  Statistic,
  Result,
  Skeleton,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FireOutlined,
  StarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import WorkCard, { Work } from '../../components/WorkCard';

const mockResults: Work[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `搜索结果作品 ${i + 1}：关于修仙的那些事`,
  cover: `https://picsum.photos/seed/search${i + 1}/300/400`,
  author: i % 2 === 0 ? '辰东' : '会说话的肘子',
  category: ['玄幻奇幻', '都市言情', '武侠仙侠', '科幻游戏'][i % 4],
  tags: ['搜索', '修仙', '爽文', '穿越'].slice(0, (i % 3) + 1),
  status: i % 3 === 0 ? 'completed' : 'ongoing',
  rating: 8 + Math.random() * 2,
  views: Math.floor(Math.random() * 2000000) + 100000,
  likes: Math.floor(Math.random() * 100000) + 5000,
  favorites: Math.floor(Math.random() * 50000) + 2000,
  words: Math.floor(Math.random() * 5000000) + 100000,
  lastChapter: `第${Math.floor(Math.random() * 1000)}章 精彩章节标题`,
  updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  description: '这是一部关于修仙、穿越、系统的精彩小说，主角一路开挂，快意恩仇。',
}));

const hotKeywords = ['修仙', '重生', '系统', '穿越', '甜宠', '末日', '三国', '无限流', '原神', '诡秘之主'];

const suggestions = [
  '修仙小说推荐',
  '重生之都市修仙',
  '系统流爽文',
  '穿越古代种田',
  '甜宠文推荐',
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState<string>();
  const [filterStatus, setFilterStatus] = useState<string>();
  const [filterWords, setFilterWords] = useState<string>();

  const total = 128;

  const doSearch = (q: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (q) {
      newParams.set('q', q);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
    setKeyword(q);

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setPage(1);

    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setKeyword(q);
      setInputValue(q);
      doSearch(q);
    }
  }, []);

  const filteredResults = results.filter((w) => {
    if (filterCategory && w.category !== filterCategory) return false;
    if (filterStatus && w.status !== filterStatus) return false;
    if (filterWords) {
      const [min, max] = filterWords.split('-').map(Number);
      if (min && w.words < min * 10000) return false;
      if (max && w.words > max * 10000) return false;
    }
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        return b.views - a.views;
      case 'rating':
        return b.rating - a.rating;
      case 'new':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'words':
        return b.words - a.words;
      default:
        return 0;
    }
  });

  const paginatedResults = sortedResults.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setFilterCategory(undefined);
    setFilterStatus(undefined);
    setFilterWords(undefined);
    setSortBy('relevance');
  };

  const hasFilter = filterCategory || filterStatus || filterWords;

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl shadow-sm">
        <div className="max-w-3xl mx-auto">
          <Input.Search
            size="large"
            placeholder="搜索作品名称、作者、标签..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={(v) => doSearch(v)}
            enterButton={<Button type="primary" size="large" icon={<SearchOutlined />}>搜索</Button>}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">热门搜索：</span>
            {hotKeywords.map((kw) => (
              <Tag.CheckableTag
                key={kw}
                checked={keyword === kw}
                onChange={() => {
                  setInputValue(kw);
                  doSearch(kw);
                }}
                className="!cursor-pointer !m-0"
              >
                {kw}
              </Tag.CheckableTag>
            ))}
          </div>
        </div>
      </Card>

      {!searched ? (
        <Card className="!rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FireOutlined className="text-red-500" />
                热门搜索
              </h3>
              <div className="space-y-2">
                {hotKeywords.slice(0, 6).map((kw, i) => (
                  <div
                    key={kw}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                    onClick={() => {
                      setInputValue(kw);
                      doSearch(kw);
                    }}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 flex items-center justify-center rounded text-xs font-bold ${
                        i < 3 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-gray-700 group-hover:text-primary-500 transition-colors">{kw}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {Math.floor(Math.random() * 100000)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <StarOutlined className="text-yellow-500" />
                搜索推荐
              </h3>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div
                    key={s}
                    className="py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-primary-500 transition-colors"
                    onClick={() => {
                      setInputValue(s);
                      doSearch(s);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <EyeOutlined className="text-blue-500" />
                最近热搜
              </h3>
              <div className="flex flex-wrap gap-2">
                {['诡秘之主', '斗破苍穹', '遮天', '完美世界', '凡人修仙传', '盗墓笔记', '全职高手', '庆余年'].map(
                  (t) => (
                    <Tag
                      key={t}
                      className="!cursor-pointer hover:!border-primary-500 hover:!text-primary-500 !m-0"
                      onClick={() => {
                        setInputValue(t);
                        doSearch(t);
                      }}
                    >
                      {t}
                    </Tag>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                搜索结果
                {keyword && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    关键词：<span className="text-primary-500">"{keyword}"</span>
                  </span>
                )}
              </h2>
              {!loading && (
                <Statistic
                  title="找到结果"
                  value={total}
                  suffix="个作品"
                  className="!mb-0"
                  styles={{ content: { fontSize: 16, fontWeight: 500 } }}
                />
              )}
            </div>

            <Space wrap>
              {hasFilter && (
                <Button icon={<ClearOutlined />} onClick={clearFilters} size="middle">
                  清除筛选
                </Button>
              )}
              <Tooltip title="筛选">
                <Select
                  placeholder="分类"
                  allowClear
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: 130 }}
                  options={[
                    { value: '玄幻奇幻', label: '玄幻奇幻' },
                    { value: '武侠仙侠', label: '武侠仙侠' },
                    { value: '都市言情', label: '都市言情' },
                    { value: '历史军事', label: '历史军事' },
                    { value: '科幻游戏', label: '科幻游戏' },
                    { value: '悬疑灵异', label: '悬疑灵异' },
                  ]}
                />
              </Tooltip>
              <Select
                placeholder="状态"
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 110 }}
                options={[
                  { value: 'ongoing', label: '连载中' },
                  { value: 'completed', label: '已完结' },
                ]}
              />
              <Select
                placeholder="字数"
                allowClear
                value={filterWords}
                onChange={setFilterWords}
                style={{ width: 130 }}
                options={[
                  { value: '0-50', label: '50万字以下' },
                  { value: '50-100', label: '50-100万字' },
                  { value: '100-200', label: '100-200万字' },
                  { value: '200-99999', label: '200万字以上' },
                ]}
              />
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 130 }}
                prefix={<FilterOutlined className="text-gray-400" />}
                options={[
                  { value: 'relevance', label: '相关度' },
                  { value: 'hot', label: '人气最高' },
                  { value: 'rating', label: '评分最高' },
                  { value: 'new', label: '最新更新' },
                  { value: 'words', label: '字数最多' },
                ]}
              />
            </Space>
          </div>

          <Skeleton loading={loading} active paragraph={{ rows: 8 }}>
            {paginatedResults.length === 0 ? (
              <Result
                status="404"
                title="未找到相关作品"
                subTitle="换个关键词试试吧，或清除筛选条件"
                extra={
                  <Space>
                    <Button
                      onClick={() => {
                        setInputValue('');
                        setKeyword('');
                        setSearched(false);
                        setResults([]);
                        clearFilters();
                        const newParams = new URLSearchParams();
                        setSearchParams(newParams);
                      }}
                    >
                      返回
                    </Button>
                    {hasFilter && (
                      <Button type="primary" onClick={clearFilters}>
                        清除筛选
                      </Button>
                    )}
                  </Space>
                }
              />
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {paginatedResults.map((work) => (
                    <Col xs={12} sm={8} md={6} lg={6} key={work.id}>
                      <WorkCard work={work} />
                    </Col>
                  ))}
                </Row>
                <div className="flex justify-center mt-8">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(t) => `共 ${t} 条结果`}
                    onChange={(p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </>
            )}
          </Skeleton>
        </>
      )}
    </div>
  );
}
