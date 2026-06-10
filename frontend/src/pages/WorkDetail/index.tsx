import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Tag,
  Avatar,
  Rate,
  Tabs,
  Table,
  Badge,
  Tooltip,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
  Dropdown,
  Empty,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  ReadOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  GiftOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  TrophyOutlined,
  DownloadOutlined,
  BookOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CommentList, { Comment } from '../../components/CommentList';
import RewardModal, { Reward } from '../../components/RewardModal';
import { useAuthStore } from '../../store/useAuthStore';

interface Volume {
  id: number;
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  id: number;
  title: string;
  words: number;
  updatedAt: string;
  isFree: boolean;
  isRead?: boolean;
}

const mockWork = {
  id: 1,
  title: '诸天万界：开局签到混沌体',
  cover: 'https://picsum.photos/seed/bookdetail/400/600',
  author: '辰东',
  authorAvatar: 'https://picsum.photos/seed/author1/100/100',
  category: '玄幻奇幻',
  subCategory: '东方玄幻',
  tags: ['爽文', '穿越', '系统', '无敌流', '诸天'],
  status: 'ongoing',
  rating: 9.2,
  ratingCount: 28560,
  views: 1250000,
  likes: 89000,
  favorites: 45000,
  subscribers: 32000,
  rewardTotal: 256800,
  words: 1580000,
  chapters: 528,
  createdAt: '2023-06-15',
  updatedAt: new Date().toISOString(),
  lastChapterTitle: '第528章 混沌神雷，万法皆空',
  description:
    '穿越到灵气复苏、诸天争霸的世界，林辰开局获得签到系统，签到就送混沌体！\n\n从此，他踏上一条横推诸天、碾压一切的无敌之路。\n\n什么天骄圣子，什么帝族古教，在我面前，皆为蝼蚁！\n\n“我有一莲，可葬诸天；我有一剑，可破万法！”——林辰',
  authorWorks: 5,
  authorFollowers: 128000,
};

const mockVolumes: Volume[] = [
  {
    id: 1,
    title: '第一卷：初入异界',
    chapters: Array.from({ length: 80 }, (_, i) => ({
      id: i + 1,
      title: `第${i + 1}章 ${['穿越异界，签到系统激活', '混沌体成，震惊全城', '初试牛刀，碾压天骄', '获得传承，实力暴涨', '风云际会，秘境开启'][i % 5]}`,
      words: 2500 + Math.floor(Math.random() * 2000),
      updatedAt: new Date(Date.now() - (80 - i) * 3600 * 1000).toISOString(),
      isFree: i < 20,
      isRead: i < 30,
    })),
  },
  {
    id: 2,
    title: '第二卷：风云际会',
    chapters: Array.from({ length: 120 }, (_, i) => ({
      id: 80 + i + 1,
      title: `第${80 + i + 1}章 精彩章节标题 ${i + 1}`,
      words: 2500 + Math.floor(Math.random() * 2000),
      updatedAt: new Date(Date.now() - (120 - i) * 3600 * 1000).toISOString(),
      isFree: false,
      isRead: i < 250 - 80,
    })),
  },
  {
    id: 3,
    title: '第三卷：横推诸天',
    chapters: Array.from({ length: 328 }, (_, i) => ({
      id: 200 + i + 1,
      title: `第${200 + i + 1}章 ${i === 327 ? '混沌神雷，万法皆空' : '精彩章节标题 ' + (i + 1)}`,
      words: 2500 + Math.floor(Math.random() * 2000),
      updatedAt: new Date(Date.now() - (328 - i) * 3600 * 1000).toISOString(),
      isFree: false,
      isRead: i < 528 - 200 - 100,
    })),
  },
];

const mockComments: Comment[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  userId: i + 100,
  username: `user${i + 1}`,
  nickname: ['书友123', '追更狂人', '老书虫', '作者铁粉', '萌新读者', '修仙爱好者', '书荒终结者', '十年老白'][i],
  avatar: `https://picsum.photos/seed/comment${i + 1}/80/80`,
  content: [
    '这本书写得太棒了！剧情紧凑，节奏把握得很好，人物塑造也很立体，强烈推荐！',
    '每天必追，已经连续追了三个月了，大大加油更新！',
    '老书虫飘过，这本书是今年看过最好看的玄幻，没有之一。',
    '混沌体这个设定太酷了，主角一路横推的感觉真爽！',
    '新人报道，刚入坑，请问这篇文虐吗？有没有女主？',
    '作者大大文笔不错，就是更新能不能再快点，不够看啊！',
    '第520章那一段写得太感人了，眼泪哗哗的。',
    '支持作者，打赏走起来！',
  ][i],
  createdAt: new Date(Date.now() - i * 3600 * 1000 * 5).toISOString(),
  likes: Math.floor(Math.random() * 500),
  dislikes: Math.floor(Math.random() * 20),
  isLiked: i < 3,
  replies:
    i === 0
      ? [
          {
            id: 1001,
            userId: 200,
            username: 'author',
            nickname: '辰东',
            avatar: 'https://picsum.photos/seed/author1/80/80',
            content: '感谢支持！会继续努力的！',
            createdAt: new Date().toISOString(),
            likes: 89,
            dislikes: 0,
            replyTo: '书友123',
          },
        ]
      : undefined,
}));

const mockRewards: Reward[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  userId: i + 1000,
  username: `reward_user_${i}`,
  nickname: ['神豪1号', '打赏达人', '土豪书友', 'VIP读者', '默默支持', '真爱粉', '盟主大人', '黄金盟主', '白银盟', '小粉丝'][i % 10],
  avatar: `https://picsum.photos/seed/reward${i + 1}/80/80`,
  amount: [1000, 888, 666, 500, 300, 200, 100, 88, 66, 50, 30, 20, 10, 10, 5][i],
  message: i < 5 ? ['大大加油！', '写得太好了！', '支持支持！', '期待后续！', '书很棒！'][i] : undefined,
  createdAt: new Date(Date.now() - i * 3600 * 1000 * 24).toISOString(),
}));

const formatNumber = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toString();
};

export default function WorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [unfoldAll, setUnfoldAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [comments, setComments] = useState(mockComments);

  const work = mockWork;
  const volumes = mockVolumes;

  const totalChapters = volumes.reduce((sum, v) => sum + v.chapters.length, 0);
  const readChapters = volumes.reduce(
    (sum, v) => sum + v.chapters.filter((c) => c.isRead).length,
    0
  );

  const firstChapter = volumes[0]?.chapters[0];
  const lastChapter = volumes[volumes.length - 1]?.chapters[volumes[volumes.length - 1].chapters.length - 1];
  const continueChapter =
    volumes.flatMap((v) => v.chapters).find((c) => !c.isRead) || firstChapter;

  const handleFavorite = () => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? '已取消收藏' : '已加入书架');
  };

  const handleLike = () => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setIsLike(!isLike);
  };

  const handleSubscribe = () => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setIsSubscribed(!isSubscribed);
    message.success(isSubscribed ? '已取消订阅' : '订阅成功，更新会第一时间通知您');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    } catch {
      message.info(`分享链接：${window.location.href}`);
    }
  };

  const renderChapterList = (chapters: Chapter[], isFirstVolume: boolean) => {
    const displayChapters = !unfoldAll && isFirstVolume ? chapters.slice(0, 15) : chapters;
    return displayChapters.map((chapter) => (
      <Link
        key={chapter.id}
        to={`/reader/${work.id}/${chapter.id}`}
        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 group transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {chapter.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
          )}
          {!chapter.isFree && (
            <Tag color="gold" className="!text-xs !py-0 !px-1.5 shrink-0">
              VIP
            </Tag>
          )}
          <span
            className={`truncate ${
              chapter.isRead ? 'text-gray-400' : 'text-gray-700 group-hover:text-primary-500'
            }`}
          >
            {chapter.title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 ml-4">
          <span>{formatNumber(chapter.words)}字</span>
          <span className="hidden sm:inline">{dayjs(chapter.updatedAt).format('MM-DD')}</span>
        </div>
      </Link>
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-40 md:w-52 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                <img src={work.cover} alt={work.title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-white min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Tag color="blue" className="!m-0">{work.category}</Tag>
                <Tag color={work.status === 'ongoing' ? 'processing' : 'success'} className="!m-0">
                  {work.status === 'ongoing' ? '连载中' : '已完结'}
                </Tag>
                {work.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} className="!m-0 !bg-white/10 !text-white/80 !border-white/20">
                    #{tag}
                  </Tag>
                ))}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-3">{work.title}</h1>

              <Link
                to="#"
                className="inline-flex items-center gap-2 mb-4 hover:text-primary-300 transition-colors"
              >
                <Avatar src={work.authorAvatar} size={32} />
                <span className="font-medium">{work.author}</span>
                <Badge count={work.authorWorks} className="!ml-2" offset={[0, 0]}>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">
                    {work.authorWorks}本书
                  </span>
                </Badge>
                <Button type="text" size="small" className="!text-white/60 !h-auto !p-0 hover:!text-white">
                  <PlusOutlined /> 关注
                </Button>
              </Link>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <StarOutlined className="text-yellow-400" />
                    评分
                  </div>
                  <div className="text-xl font-bold flex items-center gap-1 mt-1">
                    <Rate value={work.rating} disabled count={1} className="!text-yellow-400 !text-sm" />
                    {work.rating.toFixed(1)}
                    <span className="text-xs font-normal text-white/50">({formatNumber(work.ratingCount)}人评)</span>
                  </div>
                </div>
                <div>
                  <div className="text-white/60 text-sm flex items-center gap-1">
                    <EyeOutlined /> 阅读数
                  </div>
                  <div className="text-xl font-bold mt-1">{formatNumber(work.views)}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm flex items-center gap-1">
                    <FireOutlined /> 打赏
                  </div>
                  <div className="text-xl font-bold mt-1">¥{formatNumber(work.rewardTotal)}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm flex items-center gap-1">
                    <BookOutlined /> 字数
                  </div>
                  <div className="text-xl font-bold mt-1">{formatNumber(work.words)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {continueChapter && (
                  <Link to={`/reader/${work.id}/${continueChapter.id}`}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ReadOutlined />}
                      className="!h-11 !px-8 !font-semibold"
                    >
                      {readChapters > 0 ? `继续阅读 第${continueChapter.id}章` : '开始阅读'}
                    </Button>
                  </Link>
                )}
                <Button
                  size="large"
                  icon={isSubscribed ? <MinusOutlined /> : <PlusOutlined />}
                  onClick={handleSubscribe}
                  className={`!h-11 ${isSubscribed ? '' : '!border-primary-500 !text-primary-500 hover:!bg-primary-50'}`}
                >
                  {isSubscribed ? '取消订阅' : '订阅更新'}
                </Button>
                <Tooltip title="加入书架">
                  <Button
                    size="large"
                    icon={isFavorite ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
                    onClick={handleFavorite}
                    className={`!h-11 ${isFavorite ? '!text-yellow-500' : ''}`}
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                    <span className="text-xs text-gray-400 ml-1">({formatNumber(work.favorites)})</span>
                  </Button>
                </Tooltip>
                <Button
                  size="large"
                  icon={isLike ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                  onClick={handleLike}
                  className={`!h-11 ${isLike ? '!text-red-500' : ''}`}
                >
                  点赞
                  <span className="text-xs text-gray-400 ml-1">({formatNumber(work.likes)})</span>
                </Button>
                <Button
                  size="large"
                  icon={<GiftOutlined />}
                  onClick={() => setRewardModalOpen(true)}
                  className="!h-11 !text-yellow-600 !border-yellow-500 hover:!bg-yellow-50"
                >
                  打赏
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      { key: 'copy', icon: <ShareAltOutlined />, label: '复制链接', onClick: handleShare },
                      { key: 'download', icon: <DownloadOutlined />, label: '下载全本' },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button size="large" className="!h-11">
                    <ShareAltOutlined />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileTextOutlined className="text-primary-500" />
            作品简介
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {work.description}
          </p>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Statistic title="总章节" value={totalChapters} suffix="章" />
            <Statistic title="已读进度" value={totalChapters > 0 ? ((readChapters / totalChapters) * 100).toFixed(1) : 0} suffix="%" />
            <Statistic
              title="最近更新"
              value={work.lastChapterTitle}
              prefix={<ClockCircleOutlined />}
              className="md:col-span-2"
              styles={{ content: { fontSize: 14, fontWeight: 'normal' } }}
            />
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BookOutlined className="text-primary-500" />
                  <span className="font-semibold">作品目录</span>
                  <Tag className="!text-xs !m-0">共 {totalChapters} 章</Tag>
                </div>
                <div className="flex items-center gap-3">
                  <Button.Group size="small">
                    <Button
                      type={sortOrder === 'asc' ? 'primary' : 'default'}
                      onClick={() => setSortOrder('asc')}
                    >
                      正序
                    </Button>
                    <Button
                      type={sortOrder === 'desc' ? 'primary' : 'default'}
                      onClick={() => setSortOrder('desc')}
                    >
                      倒序
                    </Button>
                  </Button.Group>
                  <Button type="link" size="small" onClick={() => setUnfoldAll(!unfoldAll)}>
                    {unfoldAll ? '收起' : '展开全部'}
                  </Button>
                </div>
              </div>
            }
            className="!rounded-2xl"
            styles={{ body: { padding: 0 } }}
          >
            <div className="divide-y divide-gray-50">
              {(sortOrder === 'asc' ? volumes : [...volumes].reverse()).map((volume, vi) => (
                <div key={volume.id}>
                  <div className="px-6 py-3 bg-gray-50/50 font-medium text-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-500">{sortOrder === 'asc' ? `第${vi + 1}卷` : `第${volumes.length - vi}卷`}</span>
                      {volume.title}
                    </div>
                    <span className="text-xs text-gray-400">{volume.chapters.length}章</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 px-3 py-2 gap-1">
                    {sortOrder === 'asc'
                      ? renderChapterList(volume.chapters, vi === 0)
                      : renderChapterList([...volume.chapters].reverse(), vi === volumes.length - 1)}
                  </div>
                </div>
              ))}
            </div>
            {!unfoldAll && (
              <div className="p-4 border-t border-gray-100 text-center">
                <Button onClick={() => setUnfoldAll(true)}>
                  查看全部 {totalChapters} 章
                  <ArrowRightOutlined />
                </Button>
              </div>
            )}
          </Card>

          <div className="mt-6">
            <CommentList
              comments={comments}
              total={256}
              onSubmit={async (content) => {
                const newComment: Comment = {
                  id: Date.now(),
                  userId: user?.id || 0,
                  username: user?.username || 'guest',
                  nickname: user?.nickname || '匿名用户',
                  avatar: user?.avatar,
                  content,
                  createdAt: new Date().toISOString(),
                  likes: 0,
                  dislikes: 0,
                };
                setComments([newComment, ...comments]);
              }}
              onLike={(id) => {
                setComments(
                  comments.map((c) =>
                    c.id === id
                      ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
                      : c
                  )
                );
              }}
            />
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <TrophyOutlined className="text-yellow-500" />
                  <span className="font-semibold">打赏榜</span>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<GiftOutlined />}
                  onClick={() => setRewardModalOpen(true)}
                >
                  打赏支持
                </Button>
              </div>
            }
            className="!rounded-2xl mb-6"
          >
            {mockRewards.length === 0 ? (
              <Empty description="暂无打赏" className="py-6" />
            ) : (
              <div className="space-y-3">
                {mockRewards.slice(0, 10).map((reward, i) => (
                  <div key={reward.id} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : i === 1
                          ? 'bg-gray-300 text-gray-700'
                          : i === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </span>
                    <Avatar src={reward.avatar} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{reward.nickname}</div>
                      {reward.message && (
                        <div className="text-xs text-gray-400 truncate">{reward.message}</div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-primary-500 shrink-0">
                      ¥{reward.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <FireOutlined className="text-red-500" />
                <span className="font-semibold">作者其他作品</span>
              </div>
            }
            className="!rounded-2xl"
          >
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Link
                  key={i}
                  to={`/work/${100 + i}`}
                  className="flex gap-3 group"
                >
                  <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={`https://picsum.photos/seed/authorwork${i + 1}/120/160`}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate group-hover:text-primary-500 transition-colors">
                      作者其他作品 {i + 1}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {['已完结', '连载中', '已完结', '连载中'][i]} · {formatNumber(800000 + i * 200000)}字
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <StarOutlined />
                        {(9 - i * 0.3).toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <EyeOutlined />
                        {formatNumber(100000 + i * 50000)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <RewardModal
        open={rewardModalOpen}
        onCancel={() => setRewardModalOpen(false)}
        workId={work.id}
        workTitle={work.title}
        authorName={work.author}
        rewards={mockRewards}
        rewardGoal={{
          current: work.rewardTotal,
          target: 500000,
          title: '本月月度目标',
        }}
        onReward={async (amount) => {
          mockRewards.unshift({
            id: Date.now(),
            userId: user?.id || 0,
            username: user?.username || '',
            nickname: user?.nickname || '我',
            avatar: user?.avatar,
            amount,
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
