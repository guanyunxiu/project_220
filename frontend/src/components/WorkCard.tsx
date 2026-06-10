import { Link } from 'react-router-dom';
import { Card, Tag, Avatar, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export interface Work {
  id: number;
  title: string;
  cover: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  status: 'ongoing' | 'completed';
  rating: number;
  views: number;
  likes: number;
  favorites: number;
  words: number;
  lastChapter?: string;
  updatedAt: string;
  description?: string;
}

interface WorkCardProps {
  work: Work;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function WorkCard({ work, variant = 'default' }: WorkCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  if (variant === 'compact') {
    return (
      <Link to={`/work/${work.id}`}>
        <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="w-16 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
            <img
              src={work.cover}
              alt={work.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-500 transition-colors">
              {work.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 truncate">{work.author}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <Tag color={work.status === 'ongoing' ? 'processing' : 'success'} className="!text-xs !py-0 !px-1.5">
                {work.status === 'ongoing' ? '连载中' : '已完结'}
              </Tag>
              <span className="flex items-center gap-1">
                <EyeOutlined />
                {formatNumber(work.views)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Card className="!rounded-xl hover:shadow-lg transition-all duration-300 group">
        <div className="flex gap-4">
          <Link to={`/work/${work.id}`} className="w-28 h-40 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={work.cover}
              alt={work.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="flex-1 flex flex-col min-w-0">
            <Link to={`/work/${work.id}`}>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-500 transition-colors truncate">
                {work.title}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Avatar src={work.authorAvatar} size={20} />
                <span className="truncate">{work.author}</span>
              </div>
              <Tag color="blue" className="!text-xs !m-0">
                {work.category}
              </Tag>
              <Tag color={work.status === 'ongoing' ? 'processing' : 'success'} className="!text-xs !m-0">
                {work.status === 'ongoing' ? '连载中' : '已完结'}
              </Tag>
            </div>
            <p className="text-sm text-gray-600 mt-3 line-clamp-2 flex-1">{work.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1.5">
                {work.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} className="!text-xs !bg-gray-50 !m-0">
                    #{tag}
                  </Tag>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Tooltip title="阅读数">
                  <span className="flex items-center gap-1">
                    <EyeOutlined />
                    {formatNumber(work.views)}
                  </span>
                </Tooltip>
                <Tooltip title="点赞数">
                  <span className="flex items-center gap-1">
                    <LikeOutlined />
                    {formatNumber(work.likes)}
                  </span>
                </Tooltip>
                <Tooltip title="收藏数">
                  <span className="flex items-center gap-1">
                    <StarOutlined />
                    {formatNumber(work.favorites)}
                  </span>
                </Tooltip>
              </div>
            </div>
            {work.lastChapter && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400 flex items-center justify-between">
                  <span className="truncate pr-4">最新：{work.lastChapter}</span>
                  <span className="shrink-0">{dayjs(work.updatedAt).format('MM-DD')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      className="!rounded-xl group"
      styles={{ body: { padding: 0 } }}
      cover={
        <Link to={`/work/${work.id}`} className="block aspect-[3/4] overflow-hidden rounded-t-xl">
          <img
            src={work.cover}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <Tag color={work.status === 'ongoing' ? 'processing' : 'success'} className="!text-xs">
              {work.status === 'ongoing' ? '连载' : '完结'}
            </Tag>
          </div>
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <StarOutlined />
              {work.rating.toFixed(1)}
            </div>
          </div>
        </Link>
      }
    >
      <div className="p-4">
        <Link to={`/work/${work.id}`}>
          <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-500 transition-colors">
            {work.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <Avatar src={work.authorAvatar} size={16} />
          <span className="truncate">{work.author}</span>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <EyeOutlined />
            {formatNumber(work.views)}
          </span>
          <span className="flex items-center gap-1">
            <StarOutlined />
            {formatNumber(work.favorites)}
          </span>
          <span>{formatNumber(work.words)}字</span>
        </div>
      </div>
    </Card>
  );
}
