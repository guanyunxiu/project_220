import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Tabs,
  List,
  Tag,
  Progress,
  Empty,
  Row,
  Col,
  Statistic,
  Divider,
  Table,
  Space,
  Popover,
  Switch,
  Input,
  Upload,
  message,
  Modal,
  Rate,
  Badge,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  StarOutlined,
  HistoryOutlined,
  GiftOutlined,
  SettingOutlined,
  EditOutlined,
  LogoutOutlined,
  CrownOutlined,
  WalletOutlined,
  BellOutlined,
  MailOutlined,
  SafetyOutlined,
  CameraOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAuthStore, User as UserType } from '../../store/useAuthStore';
import WorkCard, { Work } from '../../components/WorkCard';
import dayjs from 'dayjs';

interface BookItem {
  id: number;
  work: Work;
  lastReadChapter?: string;
  progress: number;
  addedAt: string;
  updatedAt: string;
}

interface HistoryItem {
  id: number;
  work: Work;
  lastReadChapter: string;
  lastReadAt: string;
  readTime: number;
}

interface RewardItem {
  id: number;
  workTitle: string;
  workCover: string;
  authorName: string;
  amount: number;
  message?: string;
  createdAt: string;
  chapterTitle?: string;
}

interface SubscriptionItem {
  id: number;
  work: Work;
  subscribedAt: string;
  expireAt: string;
  autoRenew: boolean;
}

const mockUser: UserType = {
  id: 1,
  username: 'reader001',
  nickname: '爱读书的小明',
  avatar: 'https://picsum.photos/seed/useravatar/200/200',
  email: 'user@example.com',
  role: 'user',
  balance: 1288.5,
};

const mockBookshelf: BookItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  work: {
    id: i + 100,
    title: `书架作品 ${i + 1}`,
    cover: `https://picsum.photos/seed/shelf${i}/300/400`,
    author: ['辰东', '我吃西红柿', '会说话的肘子'][i % 3],
    category: '玄幻奇幻',
    tags: ['爽文'],
    status: i % 2 === 0 ? 'ongoing' : 'completed',
    rating: 9,
    views: 1000000,
    likes: 50000,
    favorites: 20000,
    words: 1500000,
    updatedAt: new Date().toISOString(),
  },
  lastReadChapter: `第${100 + i * 20}章 精彩章节`,
  progress: 10 + i * 10,
  addedAt: new Date(Date.now() - i * 7 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
}));

const mockHistory: HistoryItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  work: {
    id: i + 200,
    title: `历史阅读 ${i + 1}`,
    cover: `https://picsum.photos/seed/history${i}/300/400`,
    author: '作者名字',
    category: '都市言情',
    tags: ['甜宠'],
    status: 'ongoing',
    rating: 8.5,
    views: 500000,
    likes: 30000,
    favorites: 15000,
    words: 800000,
    updatedAt: new Date().toISOString(),
  },
  lastReadChapter: `第${50 + i}章`,
  lastReadAt: new Date(Date.now() - i * 12 * 3600 * 1000).toISOString(),
  readTime: 30 + i * 5,
}));

const mockRewards: RewardItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  workTitle: `打赏作品 ${i + 1}`,
  workCover: `https://picsum.photos/seed/reward${i}/100/140`,
  authorName: ['作者A', '作者B', '作者C'][i % 3],
  amount: [1000, 500, 200, 100, 50, 30, 20, 10, 10, 5, 5, 2][i],
  message: i < 3 ? ['大大加油！', '写得不错！', '期待后续'][i] : undefined,
  createdAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
  chapterTitle: i % 2 === 0 ? `第${100 + i}章` : undefined,
}));

const mockSubscriptions: SubscriptionItem[] = [
  {
    id: 1,
    work: {
      id: 999,
      title: '订阅作品1',
      cover: 'https://picsum.photos/seed/sub1/300/400',
      author: '作者A',
      category: '玄幻',
      tags: [],
      status: 'ongoing',
      rating: 9.2,
      views: 0,
      likes: 0,
      favorites: 0,
      words: 2000000,
      updatedAt: new Date().toISOString(),
    },
    subscribedAt: '2024-01-01',
    expireAt: '2025-01-01',
    autoRenew: true,
  },
  {
    id: 2,
    work: {
      id: 998,
      title: '订阅作品2',
      cover: 'https://picsum.photos/seed/sub2/300/400',
      author: '作者B',
      category: '仙侠',
      tags: [],
      status: 'ongoing',
      rating: 8.8,
      views: 0,
      likes: 0,
      favorites: 0,
      words: 1500000,
      updatedAt: new Date().toISOString(),
    },
    subscribedAt: '2024-03-15',
    expireAt: '2024-06-15',
    autoRenew: false,
  },
];

const menuItems = [
  { key: '', icon: <UserOutlined />, label: '个人中心', path: '' },
  { key: 'bookshelf', icon: <BookOutlined />, label: '我的书架', path: 'bookshelf' },
  { key: 'subscriptions', icon: <StarOutlined />, label: '我的订阅', path: 'subscriptions' },
  { key: 'history', icon: <HistoryOutlined />, label: '阅读历史', path: 'history' },
  { key: 'rewards', icon: <GiftOutlined />, label: '打赏记录', path: 'rewards' },
  { key: 'settings', icon: <SettingOutlined />, label: '账号设置', path: 'settings' },
];

const { confirm } = Modal;

function UserHome() {
  const user = useAuthStore((s) => s.user) || mockUser;

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="bg-gradient-to-r from-primary-500 via-orange-500 to-pink-500 p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Badge count={<CrownOutlined className="text-yellow-300" />} offset={[-5, 5]}>
              <Avatar size={100} src={user.avatar} icon={<UserOutlined />} />
            </Badge>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold">{user.nickname}</h2>
                <Tag color="gold" className="!text-sm !m-0">
                  <CrownOutlined /> VIP会员
                </Tag>
              </div>
              <div className="text-sm opacity-90 mt-1">ID：{user.username}</div>
              <div className="mt-3 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Tag className="!bg-white/20 !text-white !border-white/30 !m-0">墨染Lv.8</Tag>
                <Tag className="!bg-white/20 !text-white !border-white/30 !m-0">忠实读者</Tag>
                <Tag className="!bg-white/20 !text-white !border-white/30 !m-0">连续签到30天</Tag>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/author/works">
                <Button icon={<EditOutlined />} className="!bg-white/20 !text-white !border-white/40 hover:!bg-white/30">
                  成为作者
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Statistic title="我的书架" value={mockBookshelf.length} prefix={<BookOutlined />} />
          <Statistic title="累计阅读" value={1258} suffix="小时" prefix={<HistoryOutlined />} />
          <Statistic title="打赏总额" value={2580} prefix="¥" />
          <Statistic title="账户余额" value={user.balance} precision={2} prefix={<WalletOutlined className="text-primary-500" />} suffix="墨币" />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold flex items-center gap-2">
                  <HistoryOutlined className="text-primary-500" />
                  最近阅读
                </span>
                <Link to="history" className="text-sm text-gray-500 hover:text-primary-500">
                  查看全部 <ArrowRightOutlined />
                </Link>
              </div>
            }
            className="!rounded-2xl"
          >
            <List
              dataSource={mockHistory.slice(0, 5)}
              renderItem={(item) => (
                <Link to={`/work/${item.work.id}`}>
                  <List.Item className="!px-0 !py-3 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
                        <img src={item.work.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.work.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          上次读到：{item.lastReadChapter} · {dayjs(item.lastReadAt).fromNow()}
                        </div>
                      </div>
                      <Button type="primary" size="small">
                        继续阅读
                      </Button>
                    </div>
                  </List.Item>
                </Link>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={<span className="font-semibold flex items-center gap-2"><BellOutlined className="text-red-500" /> 消息通知</span>}
            className="!rounded-2xl"
          >
            <List
              dataSource={[
                { id: 1, type: 'update', title: '《诸天万界》更新了第528章', time: '10分钟前' },
                { id: 2, type: 'reward', title: '您的打赏已送达作者', time: '1小时前' },
                { id: 3, type: 'system', title: '您获得了限时VIP体验券', time: '昨天' },
                { id: 4, type: 'comment', title: '您的评论收到了3个点赞', time: '2天前' },
              ]}
              renderItem={(item) => (
                <List.Item className="!px-0 !py-3 cursor-pointer hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors">
                  <div className="w-full">
                    <div className="text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.time}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold flex items-center gap-2">
              <StarOutlined className="text-yellow-500" />
              我的收藏
            </span>
            <Link to="bookshelf" className="text-sm text-gray-500 hover:text-primary-500">
              查看全部 <ArrowRightOutlined />
            </Link>
          </div>
        }
        className="!rounded-2xl"
      >
        <Row gutter={[16, 16]}>
          {mockBookshelf.slice(0, 4).map((item) => (
            <Col xs={12} sm={6} key={item.id}>
              <WorkCard work={item.work} />
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}

function BookshelfPage() {
  const [tab, setTab] = useState('all');

  return (
    <Card
      className="!rounded-2xl"
      tabBarExtraContent={
        <Space>
          <Button icon={<PlusOutlined />}>批量管理</Button>
        </Space>
      }
      tabs={{
        activeKey: tab,
        onChange: setTab,
        items: [
          { key: 'all', label: `全部 (${mockBookshelf.length})` },
          { key: 'reading', label: `正在阅读 (${mockBookshelf.filter(b => b.progress < 100).length})` },
          { key: 'finished', label: `已读完 (${mockBookshelf.filter(b => b.progress === 100).length})` },
          { key: 'updated', label: '最近更新' },
        ],
      }}
    >
      <div className="space-y-4">
        {mockBookshelf.map((item) => (
          <div key={item.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all group">
            <div className="flex gap-4">
              <Link to={`/work/${item.work.id}`} className="w-24 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.work.cover}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/work/${item.work.id}`} className="text-lg font-bold hover:text-primary-500 transition-colors">
                      {item.work.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">{item.work.author}</div>
                  </div>
                  <Popover
                    content={
                      <Space direction="vertical">
                        <Button type="text" icon={<EyeOutlined />} className="!w-full !justify-start">查看详情</Button>
                        <Button type="text" danger icon={<DeleteOutlined />} className="!w-full !justify-start">移除书架</Button>
                      </Space>
                    }
                    trigger="click"
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Popover>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>阅读进度</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress percent={item.progress} showInfo={false} size="small" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>上次读到：{item.lastReadChapter}</span>
                  <span>{dayjs(item.updatedAt).fromNow()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/reader/${item.work.id}/1`}>
                    <Button type="primary" size="small">继续阅读</Button>
                  </Link>
                  <Link to={`/work/${item.work.id}`}>
                    <Button size="small">详情</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SubscriptionsPage() {
  return (
    <Card className="!rounded-2xl">
      {mockSubscriptions.length === 0 ? (
        <Empty description="暂无订阅" className="py-12" />
      ) : (
        <div className="space-y-4">
          {mockSubscriptions.map((sub) => (
            <div key={sub.id} className="p-4 border border-gray-100 rounded-xl flex gap-4 items-center">
              <Link to={`/work/${sub.work.id}`} className="w-16 h-22 shrink-0 rounded overflow-hidden">
                <img src={sub.work.cover} alt="" className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/work/${sub.work.id}`} className="font-bold hover:text-primary-500">
                  {sub.work.title}
                </Link>
                <div className="text-sm text-gray-500 mt-1">{sub.work.author}</div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>订阅于：{dayjs(sub.subscribedAt).format('YYYY-MM-DD')}</span>
                  <span>到期：{dayjs(sub.expireAt).format('YYYY-MM-DD')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  自动续费
                  <Switch checked={sub.autoRenew} size="small" />
                </div>
                <Button type="primary" size="small">
                  续费
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function HistoryPage() {
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const columns = [
    {
      title: '作品',
      dataIndex: 'work',
      key: 'work',
      render: (work: Work, record: HistoryItem) => (
        <Link to={`/work/${work.id}`} className="flex items-center gap-3">
          <div className="w-10 h-14 rounded overflow-hidden shrink-0">
            <img src={work.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{work.title}</div>
            <div className="text-xs text-gray-400 truncate">{record.lastReadChapter}</div>
          </div>
        </Link>
      ),
    },
    {
      title: '作者',
      dataIndex: ['work', 'author'],
      key: 'author',
    },
    {
      title: '阅读时长',
      dataIndex: 'readTime',
      key: 'readTime',
      render: (t: number) => `${t}分钟`,
    },
    {
      title: '最近阅读',
      dataIndex: 'lastReadAt',
      key: 'lastReadAt',
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: HistoryItem) => (
        <Space>
          <Link to={`/reader/${record.work.id}/1`}>
            <Button type="link" size="small">
              继续阅读
            </Button>
          </Link>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="!rounded-2xl"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setClearAllOpen(true)}
        >
          清空历史
        </Button>
      }
      title={<span className="font-semibold">阅读历史（共 {mockHistory.length} 条）</span>}
    >
      <Table
        dataSource={mockHistory}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
      <Modal
        open={clearAllOpen}
        title="确认清空"
        onCancel={() => setClearAllOpen(false)}
        onOk={() => {
          message.success('历史记录已清空');
          setClearAllOpen(false);
        }}
        okText="确认清空"
        okButtonProps={{ danger: true }}
      >
        <p>确定要清空所有阅读历史吗？此操作不可恢复。</p>
      </Modal>
    </Card>
  );
}

function RewardsPage() {
  const [tab, setTab] = useState('sent');

  const totalSent = mockRewards.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="!rounded-2xl">
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Statistic title="累计打赏" value={totalSent} prefix="¥" />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="打赏作品数" value={mockRewards.length} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="本月打赏" value={520} prefix="¥" />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="排行榜名次" value={8888} suffix="名" />
          </Col>
        </Row>
      </Card>

      <Card
        className="!rounded-2xl"
        tabs={{
          activeKey: tab,
          onChange: setTab,
          items: [
            { key: 'sent', label: '我送出的' },
            { key: 'received', label: '我收到的' },
          ],
        }}
      >
        <List
          dataSource={mockRewards}
          renderItem={(item) => (
            <List.Item className="!px-0 !py-4">
              <div className="flex items-center gap-4 w-full">
                <Link to="#" className="w-12 h-16 shrink-0 rounded overflow-hidden">
                  <img src={item.workCover} alt="" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.workTitle}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    作者：{item.authorName}
                    {item.chapterTitle && ` · ${item.chapterTitle}`}
                  </div>
                  {item.message && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                      留言：{item.message}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-primary-500">-¥{item.amount}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const currentUser = user || mockUser;
  const [form, setForm] = useState({
    nickname: currentUser.nickname,
    email: currentUser.email,
    bio: '一个热爱阅读的书虫～',
  });

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('头像大小不能超过 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <Card title={<span className="font-semibold">基本信息</span>} className="!rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="text-center shrink-0">
            <Upload
              name="avatar"
              listType="picture-circle"
              className="!w-24"
              showUploadList={false}
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div>
                  <CameraOutlined className="text-2xl" />
                  <div className="text-xs mt-1">上传头像</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-400 mt-2">支持 JPG/PNG，最大 2MB</div>
          </div>

          <div className="flex-1 space-y-5 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
              <Input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                prefix={<MailOutlined />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">个人简介</label>
              <Input.TextArea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={100}
                showCount
              />
            </div>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                message.success('信息已保存');
                setUser({ ...currentUser, ...form });
              }}
            >
              <CheckOutlined />
              保存修改
            </Button>
          </div>
        </div>
      </Card>

      <Card title={<span className="font-semibold flex items-center gap-2"><SafetyOutlined className="text-green-500" /> 账号安全</span>} className="!rounded-2xl">
        <div className="divide-y divide-gray-50">
          {[
            { label: '密码', desc: '上次修改于 30天前', action: '修改密码' },
            { label: '手机号', desc: currentUser.username ? `138****${currentUser.username.slice(-4)}` : '未绑定', action: '绑定' },
            { label: '邮箱', desc: form.email || '未绑定', action: form.email ? '更换' : '绑定' },
            { label: '实名认证', desc: '已认证', action: '查看' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <Button type="link">{item.action}</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card title={<span className="font-semibold flex items-center gap-2"><SettingOutlined /> 偏好设置</span>} className="!rounded-2xl">
        <div className="divide-y divide-gray-50">
          {[
            { label: '消息推送', desc: '接收作品更新、评论回复等通知', checked: true },
            { label: '夜间模式', desc: '晚上自动切换为深色主题', checked: false },
            { label: '自动签到', desc: '每日自动签到获取奖励', checked: true },
            { label: '公开书架', desc: '允许其他用户查看你的书架', checked: false },
            { label: '允许评论回复通知', desc: '评论被回复时通过站内信通知', checked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <Switch defaultChecked={item.checked} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="!rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div>
            <div className="font-medium text-red-500">危险操作</div>
            <div className="text-sm text-gray-500 mt-0.5">注销登录或删除账号</div>
          </div>
          <Space>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                confirm({
                  title: '确认退出',
                  content: '确定要退出登录吗？',
                  onOk: () => {
                    logout();
                    message.success('已退出登录');
                  },
                });
              }}
            >
              退出登录
            </Button>
            <Button danger>注销账号</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default function User() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const currentUser = user || mockUser;

  const currentPath = location.pathname.split('/').pop() || '';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
      <Card className="!rounded-2xl !sticky !top-24 self-start" styles={{ body: { padding: 0 } }}>
        <div className="p-6 text-center border-b">
          <Avatar size={72} src={currentUser.avatar} icon={<UserOutlined />} className="mb-3" />
          <div className="font-bold">{currentUser.nickname}</div>
          <div className="text-xs text-gray-500 mt-0.5">墨币：¥{currentUser.balance?.toFixed(2)}</div>
        </div>
        <div className="p-2">
          {menuItems.map((item) => {
            const isActive = item.path === currentPath;
            return (
              <Link
                key={item.key}
                to={`/user/${item.path}`.replace(/\/$/, '/user')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={isActive ? 'text-primary-500' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Divider className="my-3" />
          {currentUser.role !== 'author' && currentUser.role !== 'admin' && (
            <Link
              to="/author/works"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 hover:bg-primary-50 text-primary-600 font-medium transition-colors"
            >
              <EditOutlined />
              <span>申请成为作者</span>
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full hover:bg-red-50 text-red-500 transition-colors"
          >
            <LogoutOutlined />
            <span>退出登录</span>
          </button>
        </div>
      </Card>

      <div>
        <Routes>
          <Route index element={<UserHome />} />
          <Route path="bookshelf" element={<BookshelfPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </div>
    </div>
  );
}
