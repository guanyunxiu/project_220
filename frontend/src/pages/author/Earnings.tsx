import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Progress,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Radio,
  Select,
  DatePicker,
  Space,
  Alert,
  Tooltip,
  Segmented,
  Empty,
  Divider,
  List,
  Avatar,
  Badge,
} from 'antd';
import {
  DollarOutlined,
  WalletOutlined,
  GiftOutlined,
  CrownOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  RiseOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface IncomeItem {
  id: number;
  type: 'subscription' | 'reward' | 'vip' | 'ad';
  workTitle: string;
  chapterTitle?: string;
  description: string;
  amount: number;
  platformFee: number;
  netIncome: number;
  status: 'settled' | 'pending' | 'refunded';
  date: string;
  reader?: { name: string; avatar: string };
}

interface WithdrawItem {
  id: number;
  amount: number;
  fee: number;
  actualAmount: number;
  method: 'alipay' | 'wechat' | 'bank';
  status: 'pending' | 'processing' | 'success' | 'failed';
  applyAt: string;
  completedAt?: string;
  remark?: string;
}

const mockIncome: IncomeItem[] = Array.from({ length: 25 }, (_, i) => {
  const types: IncomeItem['type'][] = ['subscription', 'reward', 'vip', 'subscription', 'subscription'];
  const type = types[i % 5];
  const gross = type === 'reward' ? [100, 50, 30, 200, 500, 1000][i % 6] : [12, 18, 25, 36, 48][i % 5];
  const fee = Math.floor(gross * 0.3 * 100) / 100;
  return {
    id: 10000 + i,
    type,
    workTitle: `我的作品 ${(i % 5) + 1}`,
    chapterTitle: type === 'subscription' ? `第${100 + i}章` : undefined,
    description:
      type === 'subscription'
        ? '章节订阅收入'
        : type === 'reward'
        ? '读者打赏'
        : type === 'vip'
        ? 'VIP阅读分成'
        : '广告分成',
    amount: gross,
    platformFee: fee,
    netIncome: Math.floor((gross - fee) * 100) / 100,
    status: (['settled', 'settled', 'settled', 'pending'] as const)[i % 4],
    date: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
    reader:
      type === 'reward'
        ? {
            name: ['读者A', '土豪大大', '小粉丝', '老书虫', '萌新'][i % 5],
            avatar: `https://picsum.photos/seed/reader${i}/80/80`,
          }
        : undefined,
  };
});

const mockWithdraws: WithdrawItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: 5000 + i,
  amount: [2000, 5000, 10000, 3000, 8000, 1500, 6000, 2500][i],
  fee: 2,
  actualAmount: [2000, 5000, 10000, 3000, 8000, 1500, 6000, 2500][i] - 2,
  method: (['alipay', 'wechat', 'bank', 'alipay'] as const)[i % 4],
  status: (['success', 'success', 'processing', 'pending', 'success', 'failed', 'success', 'pending'] as const)[i % 8],
  applyAt: new Date(Date.now() - i * 5 * 24 * 3600 * 1000).toISOString(),
  completedAt: i !== 3 && i !== 7 && i !== 2 ? new Date(Date.now() - (i - 1) * 5 * 24 * 3600 * 1000).toISOString() : undefined,
  remark: i === 5 ? '银行卡信息错误' : undefined,
}));

export default function Earnings() {
  const [tab, setTab] = useState('overview');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [period, setPeriod] = useState('month');
  const [incomeType, setIncomeType] = useState('all');

  // 统计数据
  const totalIncome = mockIncome.reduce((s, i) => s + i.amount, 0);
  const totalNetIncome = mockIncome.reduce((s, i) => s + i.netIncome, 0);
  const pendingIncome = mockIncome
    .filter((i) => i.status === 'pending')
    .reduce((s, i) => s + i.netIncome, 0);
  const withdrawTotal = mockWithdraws
    .filter((w) => w.status === 'success')
    .reduce((s, w) => s + w.actualAmount, 0);
  const currentBalance = totalNetIncome - withdrawTotal - pendingIncome + 8888.88;

  // 分类收入
  const incomeBreakdown = [
    { name: '订阅收入', value: 45, amount: totalNetIncome * 0.45, icon: '📖', color: 'bg-blue-500' },
    { name: '打赏收入', value: 30, amount: totalNetIncome * 0.30, icon: '🎁', color: 'bg-yellow-500' },
    { name: 'VIP分成', value: 18, amount: totalNetIncome * 0.18, icon: '👑', color: 'bg-purple-500' },
    { name: '广告分成', value: 7, amount: totalNetIncome * 0.07, icon: '📢', color: 'bg-green-500' },
  ];

  // 趋势数据
  const trendData = Array.from({ length: period === 'week' ? 7 : period === 'month' ? 30 : 12 }, (_, i) => ({
    label: period === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i] : `${i + 1}${period === 'month' ? '日' : '月'}`,
    value: Math.floor(Math.random() * 5000) + 1000,
  }));
  const maxTrend = Math.max(...trendData.map((d) => d.value));

  const incomeColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
      sorter: (a: IncomeItem, b: IncomeItem) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (t: IncomeItem['type']) => (
        <Tag
          color={
            t === 'subscription'
              ? 'blue'
              : t === 'reward'
              ? 'gold'
              : t === 'vip'
              ? 'purple'
              : 'green'
          }
          icon={
            t === 'subscription' ? (
              <WalletOutlined />
            ) : t === 'reward' ? (
              <GiftOutlined />
            ) : t === 'vip' ? (
              <CrownOutlined />
            ) : (
              <EyeOutlined />
            )
          }
        >
          {t === 'subscription' ? '订阅' : t === 'reward' ? '打赏' : t === 'vip' ? 'VIP' : '广告'}
        </Tag>
      ),
    },
    {
      title: '来源',
      key: 'source',
      render: (_: any, r: IncomeItem) => (
        <div>
          <div className="font-medium">{r.workTitle}</div>
          {r.chapterTitle && <div className="text-xs text-gray-500">{r.chapterTitle}</div>}
          {r.reader && (
            <div className="flex items-center gap-1 mt-0.5">
              <Avatar size={16} src={r.reader.avatar} />
              <span className="text-xs text-gray-500">来自 {r.reader.name}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '总收入',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (v: number) => <span className="font-medium">¥{v.toFixed(2)}</span>,
      sorter: (a: IncomeItem, b: IncomeItem) => a.amount - b.amount,
    },
    {
      title: '平台费(30%)',
      dataIndex: 'platformFee',
      key: 'fee',
      width: 110,
      render: (v: number) => <span className="text-gray-500">-¥{v.toFixed(2)}</span>,
    },
    {
      title: '实际收入',
      dataIndex: 'netIncome',
      key: 'net',
      width: 110,
      render: (v: number) => (
        <span className="text-green-600 font-bold">+¥{v.toFixed(2)}</span>
      ),
      sorter: (a: IncomeItem, b: IncomeItem) => a.netIncome - b.netIncome,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: IncomeItem['status']) =>
        s === 'settled' ? (
          <Badge status="success" text="已结算" />
        ) : s === 'pending' ? (
          <Badge status="warning" text="待结算" />
        ) : (
          <Badge status="error" text="已退款" />
        ),
    },
  ];

  const withdrawColumns = [
    {
      title: '申请单号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: number) => <span className="font-mono">#{id}</span>,
    },
    {
      title: '申请时间',
      dataIndex: 'applyAt',
      key: 'applyAt',
      width: 160,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '提现方式',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (m: WithdrawItem['method']) => (
        <Tag
          icon={
            m === 'alipay' ? (
              <span>🔵</span>
            ) : m === 'wechat' ? (
              <span>🟢</span>
            ) : (
              <BankOutlined />
            )
          }
          color={m === 'alipay' ? 'blue' : m === 'wechat' ? 'green' : 'purple'}
        >
          {m === 'alipay' ? '支付宝' : m === 'wechat' ? '微信' : '银行卡'}
        </Tag>
      ),
    },
    {
      title: '提现金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (v: number) => <span className="font-medium">¥{v.toLocaleString()}</span>,
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (v: number) => <span className="text-gray-500">¥{v.toFixed(2)}</span>,
    },
    {
      title: '实际到账',
      dataIndex: 'actualAmount',
      key: 'actual',
      width: 120,
      render: (v: number) => (
        <span className="text-green-600 font-bold">¥{v.toLocaleString()}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: WithdrawItem['status'], row: WithdrawItem) => (
        <div>
          <Badge
            status={
              s === 'success'
                ? 'success'
                : s === 'failed'
                ? 'error'
                : s === 'processing'
                ? 'processing'
                : 'warning'
            }
            text={
              s === 'success'
                ? '已到账'
                : s === 'failed'
                ? '失败'
                : s === 'processing'
                ? '处理中'
                : '待审核'
            }
          />
          {row.remark && s === 'failed' && (
            <div className="text-xs text-red-500 mt-0.5">{row.remark}</div>
          )}
        </div>
      ),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 160,
      render: (d?: string) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  const filteredIncome = mockIncome.filter(
    (i) => incomeType === 'all' || i.type === incomeType
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarOutlined className="text-green-500" />
            收益中心
          </h1>
          <p className="text-gray-500 mt-1">查看你的创作收益和提现记录</p>
        </div>
        <Space>
          <Segmented
            value={period}
            onChange={(v) => setPeriod(String(v))}
            options={[
              { label: '本周', value: 'week' },
              { label: '本月', value: 'month' },
              { label: '本年', value: 'year' },
              { label: '全部', value: 'all' },
            ]}
          />
          <RangePicker />
          <Button icon={<DownloadOutlined />}>导出报表</Button>
          <Button
            type="primary"
            size="large"
            icon={<WalletOutlined />}
            onClick={() => setWithdrawOpen(true)}
            disabled={currentBalance < 100}
            className="!h-10 !bg-gradient-to-r !from-green-500 !to-emerald-500 !border-0"
          >
            申请提现
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="收益规则说明"
        description={
          <ul className="text-xs text-gray-600 list-disc pl-4 mt-1 space-y-0.5">
            <li>平台分成比例：作者70%，平台30%</li>
            <li>每日凌晨自动结算前一日收入，结算后可提现</li>
            <li>最低提现金额：¥100，提现手续费：¥2/笔</li>
            <li>提现到账时间：1-3个工作日</li>
          </ul>
        }
        closable
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="!rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
            <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm opacity-90">可提现余额</span>
                <Tooltip title="可随时申请提现">
                  <InfoCircleOutlined />
                </Tooltip>
              </div>
              <div className="text-3xl font-bold mb-1">
                ¥{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs opacity-75">
                {currentBalance >= 100 ? (
                  <span className="flex items-center gap-1">
                    <CheckCircleOutlined /> 可申请提现
                  </span>
                ) : (
                  <span>还差 ¥{(100 - currentBalance).toFixed(2)} 可提现</span>
                )}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-2xl">
            <Statistic
              title={
                <span className="flex items-center gap-1">
                  累计总收入
                  <Tooltip title="扣除平台费前">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </span>
              }
              value={totalIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3b82f6' }}
              suffix={
                <span className="text-xs text-green-500 font-normal">
                  <ArrowUpOutlined /> 12.5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-2xl">
            <Statistic
              title="累计净收入"
              value={totalNetIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#10b981' }}
              suffix={
                <span className="text-xs text-green-500 font-normal">
                  <ArrowUpOutlined /> 15.8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="!rounded-2xl">
            <Statistic
              title={
                <span className="flex items-center gap-1">
                  待结算
                  <Tooltip title="还未到结算日的收入">
                    <InfoCircleOutlined className="text-gray-400" />
                  </Tooltip>
                </span>
              }
              value={pendingIncome}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="font-semibold flex items-center gap-2">
                <LineChartOutlined className="text-primary-500" />
                收益趋势
              </span>
            }
            className="!rounded-2xl"
            extra={<Tag color="blue">净收入</Tag>}
          >
            <div className="h-64 flex items-end justify-between gap-1.5 px-2">
              {trendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-xs text-gray-500 whitespace-nowrap">¥{(d.value / 1000).toFixed(1)}k</div>
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-orange-400 rounded-t transition-all hover:from-primary-600 hover:to-orange-500 hover:shadow-lg cursor-pointer"
                    style={{ height: `${(d.value / maxTrend) * 70}%`, minHeight: 4 }}
                    title={`${d.label}: ¥${d.value.toLocaleString()}`}
                  />
                  <div className="text-xs text-gray-500 truncate w-full text-center">{d.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="font-semibold flex items-center gap-2">
                <BarChartOutlined className="text-purple-500" />
                收入构成
              </span>
            }
            className="!rounded-2xl"
          >
            <div className="space-y-5">
              {incomeBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      {item.name}
                    </span>
                    <span className="font-bold">¥{item.amount.toFixed(0)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all hover:opacity-80`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-0.5">{item.value}%</div>
                </div>
              ))}
            </div>
            <Divider />
            <div className="text-center">
              <div className="text-sm text-gray-500">本周期净收入</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                ¥{totalNetIncome.toLocaleString()}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        className="!rounded-2xl"
        tabBarExtraContent={
          <div className="flex gap-3">
            <Select
              value={incomeType}
              onChange={setIncomeType}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'subscription', label: '订阅收入' },
                { value: 'reward', label: '打赏收入' },
                { value: 'vip', label: 'VIP分成' },
                { value: 'ad', label: '广告分成' },
              ]}
            />
          </div>
        }
      >
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'overview',
              label: (
                <span className="flex items-center gap-1 px-1">
                  <RiseOutlined />
                  收入明细
                  <Tag color="blue" className="!ml-1">
                    {filteredIncome.length}
                  </Tag>
                </span>
              ),
              children: (
                <Table
                  columns={incomeColumns}
                  dataSource={filteredIncome}
                  rowKey="id"
                  scroll={{ x: 900 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (t) => `共 ${t} 条收入记录，合计 ¥${filteredIncome.reduce((s, i) => s + i.netIncome, 0).toFixed(2)}`,
                  }}
                  summary={(pageData) => {
                    const pageTotal = pageData.reduce((s, i) => s + i.netIncome, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell colSpan={6} index={0} className="text-right font-medium">
                            本页合计净收入
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6} className="font-bold text-green-600">
                            ¥{pageTotal.toFixed(2)}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={7} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              ),
            },
            {
              key: 'withdraw',
              label: (
                <span className="flex items-center gap-1 px-1">
                  <BankOutlined />
                  提现记录
                  <Tag color="orange" className="!ml-1">
                    {mockWithdraws.length}
                  </Tag>
                </span>
              ),
              children: (
                <div className="space-y-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={8}>
                      <Statistic
                        title="已提现金额"
                        value={withdrawTotal}
                        prefix="¥"
                        valueStyle={{ color: '#10b981' }}
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title="提现次数"
                        value={mockWithdraws.filter((w) => w.status === 'success').length}
                        suffix="次"
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title="处理中"
                        value={mockWithdraws.filter((w) => w.status === 'pending' || w.status === 'processing').length}
                        suffix="笔"
                        valueStyle={{ color: '#f59e0b' }}
                      />
                    </Col>
                  </Row>

                  <Table
                    columns={withdrawColumns}
                    dataSource={mockWithdraws}
                    rowKey="id"
                    scroll={{ x: 900 }}
                    pagination={{
                      pageSize: 10,
                      showTotal: (t) => `共 ${t} 条提现记录`,
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'ranking',
              label: (
                <span className="flex items-center gap-1 px-1">
                  <CrownOutlined />
                  打赏榜
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4 flex gap-2">
                    <Segmented
                      options={[
                        { label: '本周', value: 'week' },
                        { label: '本月', value: 'month' },
                        { label: '全部', value: 'all' },
                      ]}
                      defaultValue="week"
                    />
                  </div>
                  <List
                    dataSource={Array.from({ length: 10 }, (_, i) => ({
                      rank: i + 1,
                      name: ['神豪大大', '土豪一号', '书迷甲', 'VIP读者', '默默支持', '真爱粉', '盟主大人', '黄金盟', '白银盟', '小粉丝'][i],
                      avatar: `https://picsum.photos/seed/earank${i}/80/80`,
                      amount: [10000, 8888, 6666, 5000, 3000, 2000, 1000, 888, 666, 500][i],
                      count: 20 - i,
                    }))}
                    renderItem={(item) => (
                      <List.Item className="!px-0 !py-3">
                        <div className="flex items-center gap-4 w-full">
                          <span
                            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${
                              item.rank === 1
                                ? 'bg-yellow-400 text-yellow-900'
                                : item.rank === 2
                                ? 'bg-gray-300 text-gray-700'
                                : item.rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                          </span>
                          <Avatar size={40} src={item.avatar} />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">累计打赏 {item.count} 次</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-500 text-lg">¥{item.amount.toLocaleString()}</div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="申请提现"
        open={withdrawOpen}
        onCancel={() => setWithdrawOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Alert
            type="info"
            showIcon
            message={`可提现余额：¥${currentBalance.toFixed(2)}`}
            description="最低提现金额 ¥100，每笔手续费 ¥2"
            className="mb-5"
          />

          <Form.Item
            label="提现方式"
            name="method"
            rules={[{ required: true, message: '请选择提现方式' }]}
            initialValue="alipay"
          >
            <Radio.Group>
              <Radio.Button value="alipay" className="!w-1/3 !text-center !h-auto !py-3">
                <div className="text-2xl mb-1">🔵</div>
                <div>支付宝</div>
              </Radio.Button>
              <Radio.Button value="wechat" className="!w-1/3 !text-center !h-auto !py-3">
                <div className="text-2xl mb-1">🟢</div>
                <div>微信</div>
              </Radio.Button>
              <Radio.Button value="bank" className="!w-1/3 !text-center !h-auto !py-3">
                <div className="text-2xl mb-1">🏦</div>
                <div>银行卡</div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="提现金额"
            name="amount"
            rules={[
              { required: true, message: '请输入提现金额' },
              { type: 'number', min: 100, message: '最低提现金额 ¥100' },
              { type: 'number', max: currentBalance, message: `提现金额不能超过余额 ¥${currentBalance.toFixed(2)}` },
            ]}
          >
            <InputNumber
              size="large"
              min={100}
              max={currentBalance}
              step={100}
              className="!w-full"
              placeholder="请输入提现金额"
              prefix="¥"
              addonAfter={
                <Button type="link" size="small" onClick={() => { }}>
                  全部提现
                </Button>
              }
            />
          </Form.Item>

          <Divider />

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">提现金额</span>
              <span>¥--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">手续费</span>
              <span className="text-gray-500">-¥2.00</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>实际到账</span>
              <span className="text-green-600">¥--</span>
            </div>
          </div>

          <Form.Item name="remark" label="备注（选填）">
            <Input.TextArea rows={2} placeholder="选填，给财务的备注信息" maxLength={100} />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Space className="!w-full !justify-end">
              <Button size="large" onClick={() => setWithdrawOpen(false)}>
                取消
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  message.success('提现申请已提交，预计1-3个工作日到账');
                  setWithdrawOpen(false);
                }}
              >
                确认提现
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
