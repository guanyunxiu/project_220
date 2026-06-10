import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Button,
  Tag,
  message,
  Tooltip,
  Divider,
  Badge,
  Switch,
  Radio,
  Segmented,
  Slider,
} from 'antd';
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  StarOutlined,
  StarFilled,
  GiftOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  SettingOutlined,
  MenuOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CommentList, { Comment } from '../../components/CommentList';
import RewardModal, { Reward } from '../../components/RewardModal';
import { useAuthStore } from '../../store/useAuthStore';

interface ChapterInfo {
  id: number;
  title: string;
  words: number;
  updatedAt: string;
  isFree: boolean;
  isLocked?: boolean;
  lockReason?: string;
}

const workInfo = {
  id: 1,
  title: '诸天万界：开局签到混沌体',
  cover: 'https://picsum.photos/seed/book1/200/280',
  author: '辰东',
  status: 'ongoing',
};

const chaptersList: ChapterInfo[] = Array.from({ length: 528 }, (_, i) => ({
  id: i + 1,
  title: `第${i + 1}章 ${['穿越异界，签到系统激活', '混沌体成，震惊全城', '初试牛刀，碾压天骄', '获得传承，实力暴涨', '风云际会，秘境开启'][i % 5]}`,
  words: 2500 + Math.floor(Math.random() * 2000),
  updatedAt: new Date(Date.now() - (528 - i) * 3600 * 1000).toISOString(),
  isFree: i < 20,
  isLocked: i >= 20 && i < 23,
  lockReason: i === 20 ? '本章需订阅解锁' : i === 21 ? '本章需打赏解锁' : i === 22 ? '本章为VIP章节，请订阅后阅读' : undefined,
}));

const generateChapterContent = () => {
  const texts = [
    '林辰站在山巅之上，衣袂飘飘，双眸如电，遥望着远方连绵起伏的群山。',
    '混沌之力在他体内奔腾如江海，每一个细胞都在欢呼雀跃，仿佛有无穷无尽的力量。',
    '此时，天空突然变色，乌云翻涌之间，一道金色的闪电划破苍穹，化作一条巨龙降临人间。',
    '"这就是……混沌的力量吗？"',
    '林辰喃喃自语，他能感觉到，自己与这片天地之间，仿佛产生了某种神秘的联系。',
    '远方，无数道目光投射而来，有惊叹，有嫉妒，有恐惧，也有贪婪。',
    '但林辰毫不在意，他的目标从来不是这些凡夫俗子的看法，而是那至高无上的大道！',
    '脚下的山峰开始颤抖，仿佛承受不住他身上散发出的那股恐怖威压。',
    '体内的混沌真气运转周天，每一次循环都让他的修为更上一层楼。',
    '此刻，他终于明白，自己穿越到这个世界，绝不是偶然。',
  ];
  const paragraphs = Array.from({ length: 50 }, (_, i) => {
    const content = texts[i % texts.length];
    const extra = '这是一段关于修炼、战斗与成长的故事。主角林辰从一个普通人，逐步成长为横推诸天的强者。他经历了无数艰难险阻，结识了志同道合的伙伴，也遭遇了阴险狡诈的敌人。在这个过程中，他逐渐明白了力量的真谛，也找到了自己想要守护的东西。';
    return `<p>${content}${i % 2 === 0 ? extra : ''}</p>`;
  });
  return paragraphs.join('\n');
};

const mockComments: Comment[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  userId: i + 100,
  username: `reader${i}`,
  nickname: ['追更达人', '深夜读者', '修仙小白', '老书虫一枚', '作者忠实粉丝'][i],
  avatar: `https://picsum.photos/seed/readercmt${i}/80/80`,
  content: [
    '这一章写得太精彩了！战斗场面描写得非常细致，身临其境的感觉！',
    '熬夜追更中，大大加油！',
    '林辰终于要突破了吗？好期待下一章！',
    '作者大大更新速度真给力！',
    '这一段对话太有意思了，笑出声。',
  ][i],
  createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  likes: Math.floor(Math.random() * 200),
  dislikes: 0,
}));

const mockRewards: Reward[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  userId: 1000 + i,
  username: '',
  nickname: ['土豪1号', '打赏小能手', '书迷甲', 'VIP大佬', '路人甲', '真爱粉', '小粉丝', '读者A'][i],
  avatar: `https://picsum.photos/seed/rdrw${i}/80/80`,
  amount: [100, 50, 30, 20, 10, 10, 5, 5][i],
  message: i < 3 ? ['加油！', '写得好！', '支持作者！'][i] : undefined,
  createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
}));

export default function Reader() {
  const { workId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentChapterId, setCurrentChapterId] = useState(Number(chapterId) || 1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark' | 'green'>('light');
  const [lineHeight, setLineHeight] = useState(2);
  const [showToolbar, setShowToolbar] = useState(true);
  const [comments, setComments] = useState(mockComments);

  const currentChapter = chaptersList.find((c) => c.id === currentChapterId);
  const currentIndex = chaptersList.findIndex((c) => c.id === currentChapterId);
  const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;
  const nextChapter = currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [currentChapterId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setCurrentChapterId(Number(chapterId) || 1);
  }, [chapterId]);

  const chapterContent = generateChapterContent();

  const goToChapter = (id: number) => {
    navigate(`/reader/${workId}/${id}`);
    setSidebarOpen(false);
  };

  const handleUnlock = (type: 'subscribe' | 'reward') => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (type === 'subscribe') {
      message.success('订阅成功，开始阅读');
    } else {
      setRewardModalOpen(true);
    }
  };

  const themeStyles = {
    light: { bg: 'bg-white', text: 'text-gray-800' },
    sepia: { bg: 'bg-amber-50', text: 'text-amber-900' },
    dark: { bg: 'bg-gray-900', text: 'text-gray-200' },
    green: { bg: 'bg-green-50', text: 'text-green-900' },
  }[theme];

  if (currentChapter?.isLocked) {
    return (
      <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.text}`}>
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to={`/work/${workId}`} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
              <ArrowLeftOutlined />
              <span className="hidden sm:inline">返回作品</span>
            </Link>
            <h1 className="font-medium truncate max-w-[50%]">{workInfo.title}</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-2">本章已锁定</h2>
          <p className="text-base mb-8 opacity-75">{currentChapter.lockReason}</p>
          <div className="space-y-4 max-w-md mx-auto">
            <Button
              type="primary"
              size="large"
              block
              className="!h-12 !text-base"
              onClick={() => handleUnlock('subscribe')}
            >
              📖 订阅全本 · ¥9.9/月
            </Button>
            <Button
              size="large"
              block
              className="!h-12 !text-base !border-yellow-500 !text-yellow-600"
              onClick={() => handleUnlock('reward')}
            >
              🎁 打赏解锁本章 · ¥2.00
            </Button>
            <Button
              size="large"
              block
              className="!h-12 !text-base"
              onClick={() => setRewardModalOpen(true)}
            >
              支持作者
            </Button>
          </div>
        </div>

        <RewardModal
          open={rewardModalOpen}
          onCancel={() => setRewardModalOpen(false)}
          workId={Number(workId)}
          workTitle={workInfo.title}
          authorName={workInfo.author}
          rewards={mockRewards}
        />
      </div>
    );
  }

  const nearChapters = chaptersList.slice(
    Math.max(0, currentIndex - 2),
    Math.min(chaptersList.length, currentIndex + 3)
  );

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.text} transition-colors duration-300`}>
      <div
        className={`sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm transition-all ${
          showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to={`/work/${workId}`} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
            <ArrowLeftOutlined />
            <span className="hidden sm:inline">返回作品</span>
          </Link>

          <div className="flex-1 text-center mx-4">
            <div className="text-sm font-medium truncate">{currentChapter?.title}</div>
            <div className="text-xs opacity-60 truncate">
              {workInfo.title} · {workInfo.author}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip title="目录">
              <Button type="text" icon={<MenuOutlined />} onClick={() => setSidebarOpen(true)} />
            </Tooltip>
            <Tooltip title="阅读设置">
              <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} />
            </Tooltip>
            <Tooltip title="评论">
              <Badge count={comments.length} size="small">
                <Button type="text" icon={<CommentOutlined />} onClick={() => setCommentsOpen(true)} />
              </Badge>
            </Tooltip>
            <Tooltip title="打赏">
              <Button
                type="text"
                icon={<GiftOutlined className="!text-yellow-500" />}
                onClick={() => setRewardModalOpen(true)}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 md:py-12">
        <div className="text-center mb-8 pb-8 border-b border-current/10">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{currentChapter?.title}</h1>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-sm opacity-70">
            <span>{dayjs(currentChapter?.updatedAt).format('YYYY-MM-DD HH:mm')}</span>
            <span>·</span>
            <span>{currentChapter?.words?.toLocaleString()}字</span>
            {currentChapter?.isFree && (
              <>
                <span>·</span>
                <Tag color="green">免费章节</Tag>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Tooltip title={isFavorite ? '取消收藏' : '加入书架'}>
              <Button
                type="text"
                icon={isFavorite ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
                onClick={() => {
                  if (!token) {
                    message.warning('请先登录');
                    navigate('/login');
                    return;
                  }
                  setIsFavorite(!isFavorite);
                }}
              />
            </Tooltip>
            <Tooltip title={isLike ? '取消点赞' : '点赞'}>
              <Button
                type="text"
                icon={isLike ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                onClick={() => {
                  if (!token) {
                    message.warning('请先登录');
                    navigate('/login');
                    return;
                  }
                  setIsLike(!isLike);
                }}
              >
                <span className="ml-1 text-sm">2.3k</span>
              </Button>
            </Tooltip>
            <Tooltip title="打赏支持">
              <Button
                type="text"
                icon={<GiftOutlined className="text-yellow-500" />}
                onClick={() => setRewardModalOpen(true)}
              >
                <span className="ml-1 text-sm">打赏</span>
              </Button>
            </Tooltip>
          </div>
        </div>

        <div
          ref={contentRef}
          className="reader-content"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            color: theme === 'light' ? '#1f2937' : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: chapterContent }}
        />

        <Divider className="!my-12" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            size="large"
            icon={<LeftOutlined />}
            onClick={() => prevChapter && goToChapter(prevChapter.id)}
            disabled={!prevChapter}
            className="w-full sm:w-auto"
          >
            {prevChapter ? `上一章：${prevChapter.title}` : '已经是第一章了'}
          </Button>
          <Segmented
            value={currentChapterId}
            onChange={(v) => goToChapter(Number(v))}
            options={nearChapters.map((c) => ({ label: c.id, value: c.id }))}
          />
          <Button
            size="large"
            onClick={() => nextChapter && goToChapter(nextChapter.id)}
            disabled={!nextChapter}
            className="w-full sm:w-auto"
          >
            {nextChapter ? `下一章：${nextChapter.title}` : '已经是最新章了'}
            <RightOutlined />
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-current/10">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageOutlined />
            本章评论
          </h3>
          <CommentList
            comments={comments}
            total={comments.length + 50}
            onSubmit={async (content) => {
              const newComment: Comment = {
                id: Date.now(),
                userId: user?.id || 0,
                username: user?.username || 'guest',
                nickname: user?.nickname || '匿名',
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
      </div>

      <Drawer
        title="目录"
        placement="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={320}
      >
        <div className="space-y-1">
          {chaptersList.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => !chapter.isLocked && goToChapter(chapter.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                chapter.id === currentChapterId
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : chapter.isLocked
                  ? 'text-gray-400'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {chapter.isLocked && <span className="text-xs">🔒</span>}
                <span className="truncate flex-1">{chapter.title}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5 pl-5">
                {dayjs(chapter.updatedAt).format('MM-DD')} · {chapter.words}字
              </div>
            </button>
          ))}
        </div>
      </Drawer>

      <Drawer
        title="阅读设置"
        placement="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        width={320}
      >
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium mb-3">字号大小：{fontSize}px</div>
            <div className="flex items-center gap-3">
              <Button
                icon={<span>A</span>}
                onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              />
              <Slider
                min={14}
                max={28}
                value={fontSize}
                onChange={setFontSize}
                className="flex-1"
              />
              <Button
                icon={<span className="font-bold text-lg">A</span>}
                onClick={() => setFontSize(Math.min(28, fontSize + 1))}
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-3">行距：{lineHeight.toFixed(1)}</div>
            <Slider min={1.5} max={3} step={0.1} value={lineHeight} onChange={setLineHeight} />
          </div>

          <div>
            <div className="text-sm font-medium mb-3">阅读主题</div>
            <Radio.Group
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full"
            >
              <Radio.Button value="light" className="!w-1/4 !text-center">
                默认
              </Radio.Button>
              <Radio.Button value="sepia" className="!w-1/4 !text-center">
                护眼
              </Radio.Button>
              <Radio.Button value="green" className="!w-1/4 !text-center">
                羊皮纸
              </Radio.Button>
              <Radio.Button value="dark" className="!w-1/4 !text-center">
                夜间
              </Radio.Button>
            </Radio.Group>
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <span className="text-sm">自动隐藏工具栏</span>
            <Switch checked={!showToolbar} onChange={(v) => setShowToolbar(!v)} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">音量键翻页</span>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">自动保存阅读进度</span>
            <Switch defaultChecked />
          </div>
        </div>
      </Drawer>

      <Drawer
        title="评论区"
        placement="right"
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        width={400}
      >
        <CommentList
          comments={comments}
          onSubmit={async (content) => {
            const newComment: Comment = {
              id: Date.now(),
              userId: user?.id || 0,
              username: user?.username || 'guest',
              nickname: user?.nickname || '匿名',
              avatar: user?.avatar,
              content,
              createdAt: new Date().toISOString(),
              likes: 0,
              dislikes: 0,
            };
            setComments([newComment, ...comments]);
          }}
        />
      </Drawer>

      <RewardModal
        open={rewardModalOpen}
        onCancel={() => setRewardModalOpen(false)}
        workId={Number(workId)}
        workTitle={workInfo.title}
        authorName={workInfo.author}
        rewards={mockRewards}
      />
    </div>
  );
}
