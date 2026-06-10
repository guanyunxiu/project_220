import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  DatePicker,
  Select,
  Progress,
  Avatar,
  Tag,
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FireOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface WorkStats {
  id: string;
  title: string;
  views: number;
  cover: string;
  likes: number;
  rewards: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'), dayjs()
  ]);

  const workColumns: ColumnsType<WorkStats> = [
    {
      title: '作品',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar shape="square" size={48} src={record.cover} style={{ borderRadius: 4 }}>
            <BookOutlined />
          </Avatar>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a, b) => a.likes - b.likes,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '打赏',
      dataIndex: 'rewards',
      key: 'rewards',
      sorter: (a, b) => a.rewards - b.rewards,
      render: (val) => `¥${val.toLocaleString()}`,
    },
    {
      title: '热度',
      key: 'hot',
      render: (_, record) => {
        const hot = (record.views / 10000) * 0.4 + record.likes * 0.3 + (record.rewards / 10) * 0.3;
        const percent = Math.min(100, hot);
        return <Progress percent={Math.round(percent)} showInfo={false} size="small" />;
      },
    },
  ];

  const workData: WorkStats[] = [
    {
      id: '1',
      title: '星辰大海的冒险',
      cover: '',
      views: 125678,
      likes: 3456,
      rewards: 12580,
    },
    {
      id: '2',
      title: '都市修仙传说',
      cover: '',
      views: 98765,
      likes: 2890,
      rewards: 9870,
    },
    {
      id: '3',
      title: '异世界召唤',
      cover: '',
      views: 87654,
      likes: 2456,
      rewards: 7650,
    },
    {
      id: '4',
      title: '重生之巅峰',
      cover: '',
      views: 76543,
      likes: 2123,
      rewards: 6540,
    },
    {
      id: '5',
      title: '末世求生记',
      cover: '',
      views: 65432,
      likes: 1890,
      rewards: 5430,
    },
  ];

  const userGrowthData = Array.from({ length: 7 }).map((_, i) => ({
    date: dayjs().subtract(6 - i, 'day').format('MM-DD'),
    newUsers: Math.floor(Math.random() * 200) + 100,
    activeUsers: Math.floor(Math.random() * 500) + 500,
  }));

  const revenueData = Array.from({ length: 7 }).map((_, i) => ({
    date: dayjs().subtract(6 - i, 'day').format('MM-DD'),
    revenue: (Math.random() * 5000) + 2000,
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>数据仪表盘</Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select defaultValue="7d" style={{ width: 120 }}>
            <Option value="today">今天</Option>
            <Option value="7d">近7天</Option>
            <Option value="30d">近30天</Option>
            <Option value="90d">近90天</Option>
          </Select>
          <RangePicker value={dateRange} />
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总作品数"
              value={1256}
              prefix={<BookOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
              suffix={<Tag color="green"><ArrowUpOutlined /> 12.5%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={45678}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<Tag color="green"><ArrowUpOutlined /> 8.3%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="打赏总收入"
              value={125680}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
              suffix={<Tag color="green"><ArrowUpOutlined /> 15.2%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="今日阅读量"
              value={2345678}
              prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix={<Tag color="red"><ArrowDownOutlined /> 3.1%</Tag>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <RiseOutlined style={{ marginRight: 8 }} />
                用户增长趋势
              </span>
            }
            loading={loading}
          >
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#999' }}>
              <RocketOutlined style={{ fontSize: 48 }} />
              <div style={{ marginTop: 16 }}>用户增长图表区域</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                {userGrowthData.map((d, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                  {d.date}: 新增 {d.newUsers} 人 / 活跃 {d.activeUsers} 人
                  </div>
                ))}
              </div>
            </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DollarOutlined style={{ marginRight: 8 }} />
                打赏收入趋势
              </span>
            }
            loading={loading}
          >
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#999' }}>
                <FireOutlined style={{ fontSize: 48 }} />
                <div style={{ marginTop: 16 }}>收入统计图表区域</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                {revenueData.map((d, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    {d.date}: ¥{d.revenue.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span>
            <FireOutlined style={{ marginRight: 8, color: '#fa541c' }} />
            热门作品榜单
          </span>
        }
        loading={loading}
        extra={<a>查看全部</a>}
      >
        <Table<WorkStats>
          columns={workColumns}
          dataSource={workData}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
