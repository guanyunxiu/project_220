import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  DatePicker,
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
  ClockCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ChapterEditor from './ChapterEditor';

const { Option } = Select;
const { Search } = Input;

enum ChapterStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  BANNED = 'banned',
}

enum ChapterAccess {
  FREE = 'free',
  LOCKED = 'locked',
  PREMIUM = 'premium',
}

interface Chapter {
  id: string;
  workId: string;
  workTitle: string;
  volumeId: string;
  volumeTitle: string;
  order: number;
  title: string;
  status: ChapterStatus;
  access: ChapterAccess;
  price: number;
  wordCount: number;
  views: number;
  likes: number;
  isNsfw: boolean;
  allowComments: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const statusMap: Record<ChapterStatus, { text: string; color: string }> = {
  [ChapterStatus.DRAFT]: { text: '草稿', color: 'default' },
  [ChapterStatus.PENDING]: { text: '待审核', color: 'orange' },
  [ChapterStatus.PUBLISHED]: { text: '已发布', color: 'green' },
  [ChapterStatus.BANNED]: { text: '已封禁', color: 'red' },
};

const accessMap: Record<ChapterAccess, { text: string; color: string }> = {
  [ChapterAccess.FREE]: { text: '免费', color: 'green' },
  [ChapterAccess.LOCKED]: { text: '锁定', color: 'orange' },
  [ChapterAccess.PREMIUM]: { text: '付费', color: 'gold' },
};

const worksList = [
  { id: '1', title: '星辰大海的冒险' },
  { id: '2', title: '都市修仙传说' },
  { id: '3', title: '异世界召唤' },
  { id: '4', title: '重生之巅峰' },
];

const volumesList = [
  { id: '1', workId: '1', title: '第一卷: 启程' },
  { id: '2', workId: '1', title: '第二卷: 征途' },
  { id: '3', workId: '2', title: '第一卷: 初入都市' },
];

const ChaptersPage: React.FC = () => {
  const [data, setData] = useState<Chapter[]>([
    {
      id: '1',
      workId: '1',
      workTitle: '星辰大海的冒险',
      volumeId: '1',
      volumeTitle: '第一卷: 启程',
      order: 1,
      title: '第一章: 星空下的少年',
      status: ChapterStatus.PUBLISHED,
      access: ChapterAccess.FREE,
      price: 0,
      wordCount: 3568,
      views: 25678,
      likes: 890,
      isNsfw: false,
      allowComments: true,
      scheduledAt: null,
      publishedAt: '2025-01-15 10:30:00',
      createdAt: '2025-01-15 10:00:00',
    },
    {
      id: '2',
      workId: '1',
      workTitle: '星辰大海的冒险',
      volumeId: '1',
      volumeTitle: '第一卷: 启程',
      order: 2,
      title: '第二章: 神秘的邀请函',
      status: ChapterStatus.PUBLISHED,
      access: ChapterAccess.FREE,
      price: 0,
      wordCount: 4120,
      views: 23456,
      likes: 820,
      isNsfw: false,
      allowComments: true,
      scheduledAt: null,
      publishedAt: '2025-01-16 10:30:00',
      createdAt: '2025-01-16 10:00:00',
    },
    {
      id: '3',
      workId: '2',
      workTitle: '都市修仙传说',
      volumeId: '3',
      volumeTitle: '第一卷: 初入都市',
      order: 15,
      title: '第十五章: 初次交手',
      status: ChapterStatus.PENDING,
      access: ChapterAccess.LOCKED,
      price: 10,
      wordCount: 3890,
      views: 0,
      likes: 0,
      isNsfw: false,
      allowComments: true,
      scheduledAt: '2025-06-15 10:00:00',
      publishedAt: null,
      createdAt: '2025-06-10 14:30:00',
    },
    {
      id: '4',
      workId: '3',
      workTitle: '异世界召唤',
      volumeId: '',
      volumeTitle: '未分卷',
      order: 5,
      title: '第五话: 勇者的觉醒',
      status: ChapterStatus.DRAFT,
      access: ChapterAccess.FREE,
      price: 0,
      wordCount: 0,
      views: 0,
      likes: 0,
      isNsfw: false,
      allowComments: true,
      scheduledAt: null,
      publishedAt: null,
      createdAt: '2025-06-09 16:00:00',
    },
    {
      id: '5',
      workId: '1',
      workTitle: '星辰大海的冒险',
      volumeId: '2',
      volumeTitle: '第二卷: 征途',
      order: 100,
      title: '第一百章: 终章·新的开始',
      status: ChapterStatus.PUBLISHED,
      access: ChapterAccess.PREMIUM,
      price: 20,
      wordCount: 5680,
      views: 12345,
      likes: 1560,
      isNsfw: false,
      allowComments: true,
      scheduledAt: null,
      publishedAt: '2025-05-20 10:30:00',
      createdAt: '2025-05-20 10:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [searchText, setSearchText] = useState('');
  const [workFilter, setWorkFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ChapterStatus | ''>('');
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [schedulingChapter, setSchedulingChapter] = useState<Chapter | null>(null);
  const [scheduleForm] = Form.useForm();

  const columns: ColumnsType<Chapter> = [
    {
      title: '所属作品',
      dataIndex: 'workTitle',
      key: 'workTitle',
      width: 180,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: '所属卷',
      dataIndex: 'volumeTitle',
      key: 'volumeTitle',
      width: 140,
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: '章节序号',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title',
      width: 240,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.scheduledAt && (
            <div style={{ fontSize: 12, color: '#fa8c16', marginTop: 4 }}>
              <ClockCircleOutlined /> 定时发布: {record.scheduledAt}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ChapterStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '访问权限',
      dataIndex: 'access',
      key: 'access',
      width: 90,
      render: (access: ChapterAccess, record) => (
        <div>
          <Tag color={accessMap[access].color}>
            {accessMap[access].text}
          </Tag>
          {access !== ChapterAccess.FREE && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              ¥{record.price}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      width: 80,
      sorter: (a, b) => a.wordCount - b.wordCount,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      width: 90,
      sorter: (a, b) => a.views - b.views,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 70,
      sorter: (a, b) => a.likes - b.likes,
    },
    {
      title: 'NSFW',
      dataIndex: 'isNsfw',
      key: 'isNsfw',
      width: 70,
      render: (val, record) => (
        <Switch
          size="small"
          checked={val}
          onChange={(checked) => handleToggleNsfw(record.id, checked)}
        />
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 170,
      render: (val) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status !== ChapterStatus.PUBLISHED ? (
            <>
              <Button
                type="link"
                icon={<ClockCircleOutlined />}
                onClick={() => handleSchedule(record)}
              >
                定时
              </Button>
              <Button
                type="link"
                icon={<UpCircleOutlined />}
                onClick={() => handleToggleStatus(record.id, ChapterStatus.PUBLISHED)}
              >
                发布
              </Button>
            </>
          ) : (
            <Button
              type="link"
              danger
              icon={<DownCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, ChapterStatus.DRAFT)}
            >
              下架
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个章节吗?"
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

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setEditorVisible(true);
  };

  const handleAdd = () => {
    setEditingChapter(null);
    setEditorVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleToggleStatus = (id: string, status: ChapterStatus) => {
    setData(
      data.map((item) =>
        item.id === id ? {
          ...item,
          status,
          publishedAt: status === ChapterStatus.PUBLISHED ? new Date().toLocaleString() : null,
        } : item
      )
    );
    message.success(`操作成功: ${statusMap[status].text}`);
  };

  const handleToggleNsfw = (id: string, isNsfw: boolean) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, isNsfw } : item
      )
    );
  };

  const handleSchedule = (chapter: Chapter) => {
    setSchedulingChapter(chapter);
    scheduleForm.setFieldsValue({
      scheduledAt: chapter.scheduledAt ? dayjs(chapter.scheduledAt) : null,
    });
    setScheduleModalVisible(true);
  };

  const handleScheduleOk = async () => {
    try {
      const values = await scheduleForm.validateFields();
      const scheduledAt = values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DD HH:mm:ss') : null;
      if (schedulingChapter) {
        setData(
          data.map((item) =>
            item.id === schedulingChapter.id ? {
              ...item,
              scheduledAt,
              status: ChapterStatus.PENDING,
            } : item
          )
        );
      }
      message.success(scheduledAt ? '定时发布已设置' : '已取消定时');
      setScheduleModalVisible(false);
      setSchedulingChapter(null);
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleEditorSave = (values: any) => {
    if (editingChapter) {
      setData(
        data.map((item) =>
          item.id === editingChapter.id ? { ...item, ...values } : item
        )
      );
      message.success('章节已保存');
    } else {
      const newChapter: Chapter = {
        ...values,
        id: Date.now().toString(),
        views: 0,
        likes: 0,
        createdAt: new Date().toLocaleString(),
        scheduledAt: null,
        publishedAt: null,
      };
      setData([newChapter, ...data]);
      message.success('章节已创建');
    }
    setEditorVisible(false);
    setEditingChapter(null);
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.title.toLowerCase().includes(searchText.toLowerCase());
    const matchWork = !workFilter || item.workId === workFilter;
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchWork && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>章节管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增章节
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Select
          placeholder="选择作品"
          allowClear
          style={{ width: 200 }}
          value={workFilter || undefined}
          onChange={(val) => setWorkFilter(val || '')}
        >
          {worksList.map((w) => (
            <Option key={w.id} value={w.id}>{w.title}</Option>
          ))}
        </Select>
        <Search
          placeholder="搜索章节标题"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="章节状态"
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

      <Table<Chapter>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
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

      <ChapterEditor
        visible={editorVisible}
        editingChapter={editingChapter}
        works={worksList}
        volumes={volumesList}
        onSave={handleEditorSave}
        onCancel={() => {
          setEditorVisible(false);
          setEditingChapter(null);
        }}
      />

      <Modal
        title="定时发布"
        open={scheduleModalVisible}
        onOk={handleScheduleOk}
        onCancel={() => {
          setScheduleModalVisible(false);
          setSchedulingChapter(null);
        }}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={scheduleForm} layout="vertical">
          <Form.Item
            label="发布时间"
            name="scheduledAt"
            rules={[{ required: true, message: '请选择发布时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChaptersPage;
