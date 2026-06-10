import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Tabs, Row, Col, Button, Tag, Segmented } from 'antd';
import {
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  GiftOutlined,
  RocketOutlined,
  CrownOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  MinusOutlined,
  BookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface RankItem {
  id: number;
  rank: number;
  prevRank?: number;
  title: string;
  cover: string;
  author: string;
  category: string;
  score: number;
  change: number;
  views: number;
  words: number;
  rating: number;
  status: 'ongoing' | 'completed';
}

const generateRankData = (type: string, period: string): RankItem[] => {
  return Array.from({ length: 20 }, (_, i) => {
    const prevRank = i + 1 + Math.floor(Math.random() * 5) - 2;
    return {
      id: i + 1,
      rank: i + 1,
      prevRank: Math.max(1, Math.min(20, prevRank)),
      title: `${period}${type}榜第${i + 1}名：${['诸天万界', '剑破苍穹', '重生归来', '星河彼岸', '凡人修仙', '斗破乾坤', '神墓', '遮天', '完美世界', '长生界'][i % 10]}`,
      cover: `https://picsum.photos/seed/rank${type}${period}${i}/200/280`,
      author: ['辰东', '会说话的肘子', '我吃西红柿', '唐家三少', '天蚕土豆', '耳根', '忘语', '烽火戏诸侯'][i % 8],
      category: ['玄幻奇幻', '武侠仙侠', '都市言情', '科幻游戏', '历史军事', '悬疑灵异'][i % 6],
      score: Math.floor(1000000 / (i + 1)) + Math.floor(Math.random() * 50000),
      change: i - (prevRank - 1),
      views: Math.floor(Math.random() * 5000000) + 100000,
      words: Math.floor(Math.random() * 5000000) + 200000,
      rating: Number((9.8 - i * 0.08).toFixed(1)),
      status: i % 3 === 0 ? 'completed' : 'ongoing',
    };
  });
};

const rankTypes = [
  { key: 'hot', label: '人气榜', icon: <FireOutlined className="text-red-500" />, desc: '根据阅读、收藏、打赏综合热度' },
  { key: 'new', label: '新书榜', icon: <RocketOutlined className="text-green-500" />, desc: '30天内新书的人气排行' },
  { key: 'complete', label: '完结榜', icon: <TrophyOutlined className="text-yellow-500" />, desc: '已完结作品的经典排行' },
  { key: 'rating', label: '评分榜', icon: <StarOutlined className="text-blue-500" />, desc: '根据用户评分的综合排名' },
  { key: 'reward', label: '打赏榜', icon: <GiftOutlined className="text-purple-500" />, desc: '根据读者打赏金额排行' },
  { key: 'words', label: '更新榜', icon: <CrownOutlined className="text-orange-500" />, desc: '根据更新字数和频率排行' },
];

const periodOptions = [
  { label: '日榜', value: 'day' },
  { label: '周榜', value: 'week' },
  { label: '月榜', value: 'month' },
  { label: '总榜', value: 'all' },
];

const formatNumber = (num: number) => {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toString();
};

export default function Ranking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'hot');
  const [activePeriod, setActivePeriod] = useState('week');

  const data = generateRankData(activeType, activePeriod);

  const handleTypeChange = (key: string) => {
    setActiveType(key);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', key);
    setSearchParams(newParams);
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-lg">
          <CrownOutlined className="text-white text-xl" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-md">
          <span className="text-white font-bold text-lg">2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md">
          <span className="text-white font-bold text-lg">3</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold">
        {rank}
      </div>
    );
  };

  const renderChange = (change: number) => {
    if (change > 0) {
      return (
        <span className="text-xs flex items-center gap-0.5 text-green-500">
          <CaretUpOutlined />
          {change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="text-xs flex items-center gap-0.5 text-red-500">
          <CaretDownOutlined />
          {Math.abs(change)}
        </span>
      );
    }
    return (
      <span className="text-xs flex items-center gap-0.5 text-gray-400">
        <MinusOutlined />
        持平
      </span>
    );
  };

  const currentType = rankTypes.find((t) => t.key === activeType);

  return (
    <div className="space-y-6">
      <Card
        className="!rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="bg-gradient-to-r from-primary-500 via-orange-500 to-red-500 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrophyOutlined className="text-4xl" />
            <h1 className="text-3xl font-bold">墨染排行榜</h1>
          </div>
          <p className="text-sm opacity-90">
            {currentType?.desc} · 更新于 {dayjs().format('YYYY-MM-DD HH:mm')}
          </p>
        </div>
      </Card>

      <Card className="!rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Tabs
            activeKey={activeType}
            onChange={handleTypeChange}
            items={rankTypes.map((t) => ({
              key: t.key,
              label: (
                <span className="flex items-center gap-1.5 px-1">
                  {t.icon}
                  {t.label}
                </span>
              ),
            }))}
            className="!mb-0"
          />
          <Segmented
            value={activePeriod}
            onChange={(v) => setActivePeriod(String(v))}
            options={periodOptions}
            size="large"
          />
        </div>

        <Row gutter={[16, 16]}>
          {data.slice(0, 3).map((item) => (
            <Col xs={24} md={8} key={item.id}>
              <Link to={`/work/${item.id}`} className="block group">
                <Card
                  className={`!rounded-2xl overflow-hidden h-full transition-all hover:shadow-xl ${
                    item.rank === 1 ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                  }`}
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    className={`p-6 ${
                      item.rank === 1
                        ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100'
                        : item.rank === 2
                        ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100'
                        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100'
                    }`}
                  >
                    <div className="flex gap-4">
                      {renderRankBadge(item.rank)}
                      <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
                          {item.title}
                        </h3>
                        <div className="text-xs text-gray-500 mt-2">{item.author}</div>
                        <Tag color="blue" className="!text-xs !mt-2 !m-0">
                          {item.category}
                        </Tag>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-current/10 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <StarOutlined className="text-yellow-500" />
                          {item.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeOutlined />
                          {formatNumber(item.views)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">热度指数</div>
                        <div className="text-lg font-bold text-primary-600">
                          {formatNumber(item.score)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        <div className="mt-8">
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
            {data.slice(3).map((item) => (
              <Link
                to={`/work/${item.id}`}
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
              >
                {renderRankBadge(item.rank)}

                <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-500 transition-colors">
                      {item.title}
                    </h4>
                    <Tag
                      color={item.status === 'ongoing' ? 'processing' : 'success'}
                      className="!text-xs !py-0 !m-0 shrink-0"
                    >
                      {item.status === 'ongoing' ? '连载' : '完结'}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{item.author}</span>
                    <Tag color="blue" className="!text-xs !m-0">
                      {item.category}
                    </Tag>
                    <span className="flex items-center gap-1">
                      <BookOutlined />
                      {formatNumber(item.words)}字
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-6">
                  {renderChange(item.change)}
                  <div className="text-right">
                    <div className="text-xs text-gray-400">热度</div>
                    <div className="font-bold text-primary-600">{formatNumber(item.score)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">排行榜规则说明</h3>
              <p className="text-sm text-gray-500">
                数据每小时更新一次 · 异常数据会被过滤 · 最终解释权归平台所有
              </p>
            </div>
            <Button type="primary" size="large">
              查看完整榜单规则
              <ArrowUpOutlined className="rotate-90 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
