import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  Select,
  Tag,
  Image,
  message,
  Popconfirm,
  Switch,
  Form,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  BookOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import WorkForm from './WorkForm';

const { Option } = Select;
const { Search } = Input;

enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
  BANNED = 'banned',
}

enum WorkType {
  NOVEL = 'novel',
  COMIC = 'comic',
}

interface Work {
  id: string;
  title: string;
  cover: string;
  type: WorkType;
  status: WorkStatus;
  author: string;
  categories: string;
  totalChapters: number;
  totalViews: number;
  totalLikes: number;
  isFeatured: boolean;
  isRecommended: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

const statusMap: Record<WorkStatus, { text: string; color: string }> = {
  [WorkStatus.DRAFT]: { text: '草稿', color: 'default' },
  [WorkStatus.PUBLISHED]: { text: '连载中', color: 'green' },
  [WorkStatus.COMPLETED]: { text: '已完结', color: 'blue' },
  [WorkStatus.HIATUS]: { text: '暂停', color: 'orange' },
  [WorkStatus.BANNED]: { text: '已封禁', color: 'red' },
};

const typeMap: Record<WorkType, { text: string; color: string }> = {
  [WorkType.NOVEL]: { text: '小说', color: 'cyan' },
  [WorkType.COMIC]: { text: '漫画', color: 'purple' },
};

const WorksPage: React.FC = () => {
  const [data, setData] = useState<Work[]>([
    {
      id: '1',
      title: '星辰大海的冒险',
      cover: '',
      type: WorkType.NOVEL,
      status: WorkStatus.PUBLISHED,
      author: '张三',
      categories: '科幻,冒险',
      totalChapters: 156,
      totalViews: 125678,
      totalLikes: 3456,
      isFeatured: true,
      isRecommended: false,
      createdAt: '2024-01-15 10:30:00',
      lastUpdatedAt: '2025-06-08 14:20:00',
    },
    {
      id: '2',
      title: '都市修仙传说',
      cover: '',
      type: WorkType.NOVEL,
      status: WorkStatus.PUBLISHED,
      author: '李四',
      categories: '都市,修仙',
      totalChapters: 289,
      totalViews: 98765,
      totalLikes: 2890,
      isFeatured: false,
      isRecommended: true,
      createdAt: '2024-02-20 09:15:00',
      lastUpdatedAt: '2025-06-09 16:30:00',
    },
    {
      id: '3',
      title: '异世界召唤',
      cover: '',
      type: WorkType.COMIC,
      status: WorkStatus.DRAFT,
      author: '王五',
      categories: '异世界,奇幻',
      totalChapters: 45,
      totalViews: 87654,
      totalLikes: 2456,
      isFeatured: false,
      isRecommended: false,
      createdAt: '2024-03-10 14:00:00',
      lastUpdatedAt: '2025-06-05 11:00:00',
    },
    {
      id: '4',
      title: '重生之巅峰',
      cover: '',
      type: WorkType.NOVEL,
      status: WorkStatus.COMPLETED,
      author: '赵六',
      categories: '重生,都市',
      totalChapters: 500,
      totalViews: 76543,
      totalLikes: 2123,
      isFeatured: true,
      isRecommended: true,
      createdAt: '2023-12-01 08:00:00',
      lastUpdatedAt: '2025-04-15 20:00:00',
    },
    {
      id: '5',
      title: '末世求生记',
      cover: '',
      type: WorkType.COMIC,
      status: WorkStatus.HIATUS,
      author: '钱七',
      categories: '末世,生存',
      totalChapters: 78,
      totalViews: 65432,
      totalLikes: 1890,
      isFeatured: false,
      isRecommended: false,
      createdAt: '2024-04-18 12:30:00',
      lastUpdatedAt: '2025-03-20 10:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<WorkType | ''>('');
  const [form] = Form.useForm();

  const columns: ColumnsType<Work> = [
    {
      title: '作品信息',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 280,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            width={60}
            height={80}
            src={record.cover}
            placeholder={
              <div
                style={{
                  width: 60,
                  height: 80,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                <BookOutlined style={{ fontSize: 24, color: '#ccc' }} />
              </div>
            }
            style={{ borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#999' }}>作者: {record.author}</div>
            <Tag color={typeMap[record.type].color} style={{ marginTop: 4 }}>
              {typeMap[record.type].text}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WorkStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '章节数',
      dataIndex: 'totalChapters',
      key: 'totalChapters',
      width: 80,
      sorter: (a, b) => a.totalChapters - b.totalChapters,
    },
    {
      title: '阅读量',
      dataIndex: 'totalViews',
      key: 'totalViews',
      width: 100,
      sorter: (a, b) => a.totalViews - b.totalViews,
      render: (val) => (
        <span>
          <EyeOutlined style={{ marginRight: 4, color: '#1677ff' }} />
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: '点赞',
      dataIndex: 'totalLikes',
      key: 'totalLikes',
      width: 80,
      sorter: (a, b) => a.totalLikes - b.totalLikes,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '推荐',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 80,
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={(checked) => handleToggleFeature(record.id, checked)}
        />
      ),
    },
    {
      title: '精选',
      dataIndex: 'isRecommended',
      key: 'isRecommended',
      width: 80,
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={(checked) => handleToggleRecommend(record.id, checked)}
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdatedAt',
      key: 'lastUpdatedAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === WorkStatus.PUBLISHED || record.status === WorkStatus.HIATUS ? (
            <Button
              type="link"
              danger
              icon={<DownCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, WorkStatus.DRAFT)}
            >
              下架
            </Button>
          ) : (
            <Button
              type="link"
              icon={<UpCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, WorkStatus.PUBLISHED)}
            >
              上架
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个作品吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingWork(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleToggleStatus = (id: string, status: WorkStatus) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    message.success(`操作成功: ${statusMap[status].text}`);
  };

  const handleToggleFeature = (id: string, isFeatured: boolean) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, isFeatured } : item
      )
    );
    message.success(isFeatured ? '已设为推荐' : '已取消推荐');
  };

  const handleToggleRecommend = (id: string, isRecommended: boolean) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, isRecommended } : item
      )
    );
    message.success(isRecommended ? '已设为精选' : '已取消精选');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingWork) {
        setData(
          data.map((item) =>
            item.id === editingWork.id ? { ...item, ...values } : item
          )
        );
        message.success('编辑成功');
      } else {
        const newWork: Work = {
          ...values,
          id: Date.now().toString(),
          totalChapters: 0,
          totalViews: 0,
          totalLikes: 0,
          isFeatured: false,
          isRecommended: false,
          createdAt: new Date().toLocaleString(),
          lastUpdatedAt: new Date().toLocaleString(),
        };
        setData([newWork, ...data]);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingWork(null);
    form.resetFields();
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.author.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchType = !typeFilter || item.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>作品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增作品
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索作品名或作者"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="作品类型"
          allowClear
          style={{ width: 120 }}
          value={typeFilter || undefined}
          onChange={(val) => setTypeFilter(val || '')}
        >
          <Option value="novel">小说</Option>
          <Option value="comic">漫画</Option>
        </Select>
        <Select
          placeholder="作品状态"
          allowClear
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val || '')}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>
              {val.text}
            </Option>
          ))}
        </Select>
      </div>

      <Table<Work>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <WorkForm
        visible={modalVisible}
        editingWork={editingWork}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default WorksPage;
