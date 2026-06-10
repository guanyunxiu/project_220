import React, { useState } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tag,
  Avatar,
  Select,
  Input,
  DatePicker,
  Tabs,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  GiftOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
  FireOutlined,
  RiseOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

enum RewardStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

interface Reward {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  workId: string;
  workTitle: string;
  chapterId: string | null;
  chapterTitle: string | null;
  amount: number;
  currency: string;
  orderId: string;
  paymentMethod: string;
  status: RewardStatus;
  giftType: string | null;
  giftQuantity: number;
  isAnonymous: boolean;
  message: string | null;
  paidAt: string | null;
  createdAt: string;
}

const statusMap: Record<RewardStatus, { text: string; color: string }> = {
  [RewardStatus.PENDING]: { text: '待支付', color: 'orange' },
  [RewardStatus.COMPLETED]: { text: '已完成', color: 'green' },
  [RewardStatus.FAILED]: { text: '失败', color: 'red' },
  [RewardStatus.REFUNDED]: { text: '已退款', color: 'default' },
};

const paymentMethodMap: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
  balance: '余额支付',
  stripe: 'Stripe',
};

const giftTypes = [
  { type: 'rocket', name: '🚀 火箭', price: 666 },
  { type: 'crown', name: '👑 皇冠', price: 188 },
  { type: 'flower', name: '🌹 鲜花', price: 6 },
  { type: 'coffee', name: '☕ 咖啡', price: 20 },
  { type: 'like', name: '❤️ 爱心', price: 1 },
];

const RewardsPage: React.FC = () => {
  const [data, setData] = useState<Reward[]>([
    {
      id: '1',
      userId: '201',
      username: '土豪读者',
      avatar: '',
      workId: '1',
      workTitle: '星辰大海的冒险',
      chapterId: '100',
      chapterTitle: '第一百章: 终章·新的开始',
      amount: 666.00,
      currency: 'CNY',
      orderId: 'ORD202506100001',
      paymentMethod: 'alipay',
      status: RewardStatus.COMPLETED,
      giftType: 'rocket',
      giftQuantity: 1,
      isAnonymous: false,
      message: '大结局太棒了!支持作者大大!',
      paidAt: '2025-06-10 10:30:45',
      createdAt: '2025-06-10 10:30:00',
    },
    {
      id: '2',
      userId: '202',
      username: '匿名用户',
      avatar: '',
      workId: '2',
      workTitle: '都市修仙传说',
      chapterId: null,
      chapterTitle: null,
      amount: 376.00,
      currency: 'CNY',
      orderId: 'ORD202506100002',
      paymentMethod: 'wechat',
      status: RewardStatus.COMPLETED,
      giftType: 'crown',
      giftQuantity: 2,
      isAnonymous: true,
      message: null,
      paidAt: '2025-06-10 09:45:12',
      createdAt: '2025-06-10 09:45:00',
    },
    {
      id: '3',
      userId: '203',
      username: '路人乙',
      avatar: '',
      workId: '1',
      workTitle: '星辰大海的冒险',
      chapterId: '50',
      chapterTitle: '第五十章: 转折',
      amount: 120.00,
      currency: 'CNY',
      orderId: 'ORD202506090003',
      paymentMethod: 'balance',
      status: RewardStatus.COMPLETED,
      giftType: 'coffee',
      giftQuantity: 6,
      isAnonymous: false,
      message: '作者加油!期待更新',
      paidAt: '2025-06-09 20:30:00',
      createdAt: '2025-06-09 20:29:30',
    },
    {
      id: '4',
      userId: '204',
      username: '新读者',
      avatar: '',
      workId: '4',
      workTitle: '重生之巅峰',
      chapterId: '15',
      chapterTitle: '第十五章: 意外',
      amount: 60.00,
      currency: 'CNY',
      orderId: 'ORD202506100004',
      paymentMethod: 'wechat',
      status: RewardStatus.PENDING,
      giftType: 'flower',
      giftQuantity: 10,
      isAnonymous: false,
      message: null,
      paidAt: null,
      createdAt: '2025-06-10 11:00:00',
    },
    {
      id: '5',
      userId: '205',
      username: '书迷A',
      avatar: '',
      workId: '3',
      workTitle: '异世界召唤',
      chapterId: null,
      chapterTitle: null,
      amount: 500.00,
      currency: 'CNY',
      orderId: 'ORD202506080005',
      paymentMethod: 'alipay',
      status: RewardStatus.REFUNDED,
      giftType: 'rocket',
      giftQuantity: 1,
      isAnonymous: false,
      message: '先打赏支持一下',
      paidAt: '2025-06-08 14:20:00',
      createdAt: '2025-06-08 14:19:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RewardStatus | ''>('');
  const [workFilter, setWorkFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>([
    dayjs().subtract(30, 'day'), dayjs()
  ]);

  const worksList = [
    { id: '', title: '全部作品' },
    { id: '1', title: '星辰大海的冒险' },
    { id: '2', title: '都市修仙传说' },
    { id: '3', title: '异世界召唤' },
    { id: '4', title: '重生之巅峰' },
  ];

  const totalRevenue = data
    .filter((r) => r.status === RewardStatus.COMPLETED)
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCount = data.filter((r) => r.status === RewardStatus.COMPLETED).length;
  const avgAmount = totalCount > 0 ? totalRevenue / totalCount : 0;
  const pendingCount = data.filter((r) => r.status === RewardStatus.PENDING).length;

  const workRankingData = worksList.slice(1).map((w) => ({
    ...w,
    amount: data
      .filter((r) => r.workId === w.id && r.status === RewardStatus.COMPLETED)
      .reduce((sum, r) => sum + r.amount, 0),
    count: data.filter((r) => r.workId === w.id && r.status === RewardStatus.COMPLETED).length,
  })).sort((a, b) => b.amount - a.amount);

  const userRankingData = Array.from(new Set(data.map((r) => r.username)))
    .map((username) => {
      const userRewards = data.filter(
        (r) => r.username === username && r.status === RewardStatus.COMPLETED
      );
      return {
        username,
        avatar: data.find((r) => r.username === username)?.avatar || '',
        amount: userRewards.reduce((sum, r) => sum + r.amount, 0),
        count: userRewards.length,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const columns: ColumnsType<Reward> = [
    {
      title: '打赏用户',
      dataIndex: 'username',
      key: 'username',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={40} src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.isAnonymous ? '匿名用户' : record.username}
              {record.isAnonymous && <Tag color="default" style={{ marginLeft: 4 }}>匿名</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>订单: {record.orderId}</div>
          </div>
        </div>
      ),
    },
    {
      title: '打赏对象',
      key: 'target',
      width: 220,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <BookOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 500 }}>{record.workTitle}</span>
          </div>
          {record.chapterTitle && (
            <div style={{ color: '#666', paddingLeft: 20 }}>
              📖 {record.chapterTitle}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '礼物/金额',
      key: 'gift',
      width: 180,
      render: (_, record) => {
        const gift = giftTypes.find((g) => g.type === record.giftType);
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#fa8c16', fontSize: 16 }}>
              ¥{record.amount.toFixed(2)}
            </div>
            {gift && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {gift.name} × {record.giftQuantity}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '留言',
      dataIndex: 'message',
      key: 'message',
      width: 200,
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999' }}>无留言</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (m) => paymentMethodMap[m] || m,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: RewardStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '支付时间',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 170,
      render: (val) => val || '-',
    },
  ];

  const rankingColumns: ColumnsType<any> = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return index < 3 ? (
          <span style={{ fontSize: 18 }}>{medals[index]}</span>
        ) : (
          <span style={{ color: '#999', fontWeight: 500 }}>#{index + 1}</span>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.username && (
            <Avatar size={28} src={record.avatar} icon={<UserOutlined />} />
          )}
          <span style={{ fontWeight: 500 }}>{text || record.username}</span>
        </div>
      ),
    },
    {
      title: '总收入',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => <span style={{ color: '#fa8c16', fontWeight: 600 }}>¥{val.toFixed(2)}</span>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '打赏次数',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      align: 'right',
      render: (val) => `${val} 次`,
    },
  ];

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.username.toLowerCase().includes(searchText.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.workTitle.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchWork = !workFilter || item.workId === workFilter;
    return matchSearch && matchStatus && matchWork;
  });

  const tabItems: TabsProps['items'] = [
    {
      key: 'records',
      label: <span><GiftOutlined /> 打赏记录</span>,
      children: (
        <Table<Reward>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      ),
    },
    {
      key: 'workRanking',
      label: <span><TrophyOutlined /> 作品收入榜</span>,
      children: workRankingData.length > 0 ? (
        <Table
          columns={rankingColumns}
          dataSource={workRankingData}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      ) : (
        <Empty description="暂无数据" />
      ),
    },
    {
      key: 'userRanking',
      label: <span><FireOutlined /> 打赏土豪榜</span>,
      children: userRankingData.length > 0 ? (
        <Table
          columns={rankingColumns}
          dataSource={userRankingData}
          rowKey="username"
          pagination={false}
          size="middle"
        />
      ) : (
        <Empty description="暂无数据" />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: '#fa8c16' }} /> 打赏管理
        </h2>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          allowClear
        />
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总收入"
              value={totalRevenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<Tag color="green"><RiseOutlined /> 12.5%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="打赏笔数"
              value={totalCount}
              prefix={<GiftOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>笔</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="单笔均值"
              value={avgAmount}
              precision={2}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>元/笔</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="待处理订单"
              value={pendingCount}
              prefix={<GiftOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>笔</span>}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索用户/订单号/作品名"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="按作品筛选"
          allowClear
          style={{ width: 200 }}
          value={workFilter || undefined}
          onChange={(val) => setWorkFilter(val || '')}
        >
          {worksList.slice(1).map((w) => (
            <Option key={w.id} value={w.id}>{w.title}</Option>
          ))}
        </Select>
        <Select
          placeholder="打赏状态"
          allowClear
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val || '')}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
      </div>

      <Card bordered={false} bodyStyle={{ padding: 0 }}>
        <Tabs items={tabItems} defaultActiveKey="records" />
      </Card>
    </div>
  );
};

export default RewardsPage;
