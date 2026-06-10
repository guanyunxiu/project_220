import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  message,
  Popconfirm,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

enum VolumeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}

interface Volume {
  id: string;
  workId: string;
  workTitle: string;
  order: number;
  title: string;
  slug: string;
  cover: string;
  description: string;
  status: VolumeStatus;
  isVisible: boolean;
  totalChapters: number;
  totalWords: number;
  publishedAt: string | null;
  createdAt: string;
}

const statusMap: Record<VolumeStatus, { text: string; color: string }> = {
  [VolumeStatus.DRAFT]: { text: '草稿', color: 'default' },
  [VolumeStatus.PUBLISHED]: { text: '连载中', color: 'green' },
  [VolumeStatus.COMPLETED]: { text: '已完结', color: 'blue' },
};

const worksList = [
  { id: '1', title: '星辰大海的冒险' },
  { id: '2', title: '都市修仙传说' },
  { id: '3', title: '异世界召唤' },
  { id: '4', title: '重生之巅峰' },
];

const VolumesPage: React.FC = () => {
  const [data, setData] = useState<Volume[]>([
    {
      id: '1',
      workId: '1',
      workTitle: '星辰大海的冒险',
      order: 1,
      title: '第一卷: 启程',
      slug: 'vol-1-departure',
      cover: '',
      description: '少年离开了自己的家乡,踏上了前往星海的征途...',
      status: VolumeStatus.PUBLISHED,
      isVisible: true,
      totalChapters: 50,
      totalWords: 180000,
      publishedAt: '2025-01-15 10:30:00',
      createdAt: '2025-01-10 10:00:00',
    },
    {
      id: '2',
      workId: '1',
      workTitle: '星辰大海的冒险',
      order: 2,
      title: '第二卷: 征途',
      slug: 'vol-2-journey',
      cover: '',
      description: '在星际旅途中遇到了新的伙伴,也遭遇了前所未有的危机...',
      status: VolumeStatus.PUBLISHED,
      isVisible: true,
      totalChapters: 78,
      totalWords: 280800,
      publishedAt: '2025-03-01 10:30:00',
      createdAt: '2025-02-28 10:00:00',
    },
    {
      id: '3',
      workId: '1',
      workTitle: '星辰大海的冒险',
      order: 3,
      title: '第三卷: 归途',
      slug: 'vol-3-return',
      cover: '',
      description: '寻找回家的路,却发现真相远超想象...',
      status: VolumeStatus.DRAFT,
      isVisible: false,
      totalChapters: 12,
      totalWords: 43200,
      publishedAt: null,
      createdAt: '2025-06-01 10:00:00',
    },
    {
      id: '4',
      workId: '2',
      workTitle: '都市修仙传说',
      order: 1,
      title: '第一卷: 初入都市',
      slug: 'vol-1-city',
      cover: '',
      description: '山村少年偶然获得修仙功法,开始了不一样的都市生活...',
      status: VolumeStatus.COMPLETED,
      isVisible: true,
      totalChapters: 100,
      totalWords: 360000,
      publishedAt: '2024-12-01 10:30:00',
      createdAt: '2024-11-28 10:00:00',
    },
    {
      id: '5',
      workId: '3',
      workTitle: '异世界召唤',
      order: 1,
      title: '第一卷: 勇者召唤',
      slug: 'vol-1-summon',
      cover: '',
      description: '普通高中生意外被召唤到异世界,开始了奇幻冒险...',
      status: VolumeStatus.PUBLISHED,
      isVisible: true,
      totalChapters: 30,
      totalWords: 108000,
      publishedAt: '2025-04-01 10:30:00',
      createdAt: '2025-03-28 10:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVolume, setEditingVolume] = useState<Volume | null>(null);
  const [form] = Form.useForm();
  const [workFilter, setWorkFilter] = useState<string>('');

  const columns: ColumnsType<Volume> = [
    {
      title: '所属作品',
      dataIndex: 'workTitle',
      key: 'workTitle',
      width: 180,
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<ArrowUpOutlined />}
            onClick={() => handleMove(record.id, -1)}
          />
          <span style={{ fontWeight: 500 }}>{record.order}</span>
          <Button
            size="small"
            type="text"
            icon={<ArrowDownOutlined />}
            onClick={() => handleMove(record.id, 1)}
          />
        </Space>
      ),
    },
    {
      title: '卷封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (cover, record) => (
        <Image
          width={60}
          height={80}
          src={cover}
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
              <SafetyCertificateOutlined style={{ fontSize: 24, color: '#ccc' }} />
            </div>
          }
          style={{ borderRadius: 4 }}
        />
      ),
    },
    {
      title: '卷信息',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>Slug: {record.slug}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.5 }}>
              {record.description.length > 60
                ? record.description.slice(0, 60) + '...'
                : record.description}
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
      render: (status: VolumeStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '可见性',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      render: (val, record) => (
        <Switch
          size="small"
          checked={val}
          onChange={(checked) => handleToggleVisible(record.id, checked)}
        />
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
      title: '总字数',
      dataIndex: 'totalWords',
      key: 'totalWords',
      width: 100,
      sorter: (a, b) => a.totalWords - b.totalWords,
      render: (val) => (val / 10000).toFixed(1) + ' 万',
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
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个卷吗?"
            description="删除后卷内的章节将变为未分卷状态"
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

  const handleEdit = (volume: Volume) => {
    setEditingVolume(volume);
    form.setFieldsValue(volume);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingVolume(null);
    form.resetFields();
    form.setFieldsValue({
      status: VolumeStatus.DRAFT,
      isVisible: true,
      order: 1,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleMove = (id: string, direction: number) => {
    setData((prev) => {
      const list = [...prev];
      const idx = list.findIndex((item) => item.id === id);
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const current = list[idx];
      const target = list[targetIdx];
      list[idx] = { ...target, order: current.order };
      list[targetIdx] = { ...current, order: target.order };
      return list.sort((a, b) => a.order - b.order);
    });
    message.success('排序已更新');
  };

  const handleToggleVisible = (id: string, isVisible: boolean) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, isVisible } : item
      )
    );
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingVolume) {
        setData(
          data.map((item) =>
            item.id === editingVolume.id ? { ...item, ...values } : item
          )
        );
        message.success('编辑成功');
      } else {
        const work = worksList.find((w) => w.id === values.workId);
        const newVolume: Volume = {
          ...values,
          id: Date.now().toString(),
          workTitle: work?.title || '',
          totalChapters: 0,
          totalWords: 0,
          publishedAt: null,
          createdAt: new Date().toLocaleString(),
        };
        setData([...data, newVolume].sort((a, b) => {
          if (a.workId === b.workId) return a.order - b.order;
          return a.workId.localeCompare(b.workId);
        }));
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ cover: info.file.response?.url });
      }
    },
  };

  const filteredData = workFilter
    ? data.filter((item) => item.workId === workFilter)
    : data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>卷/集管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增卷/集
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Select
          placeholder="按作品筛选"
          allowClear
          style={{ width: 240 }}
          value={workFilter || undefined}
          onChange={(val) => setWorkFilter(val || '')}
        >
          {worksList.map((w) => (
            <Option key={w.id} value={w.id}>{w.title}</Option>
          ))}
        </Select>
      </div>

      <Table<Volume>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingVolume ? '编辑卷/集' : '新增卷/集'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setEditingVolume(null);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="所属作品"
              name="workId"
              rules={[{ required: true, message: '请选择作品' }]}
              style={{ flex: 2 }}
            >
              <Select placeholder="选择作品">
                {worksList.map((w) => (
                  <Option key={w.id} value={w.id}>{w.title}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="排序"
              name="order"
              rules={[{ required: true, message: '请输入排序号' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={1} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="卷/集标题"
              name="title"
              rules={[
                { required: true, message: '请输入标题' },
                { max: 200, message: '标题不能超过200个字符' },
              ]}
              style={{ flex: 2 }}
            >
              <Input placeholder="如: 第一卷: 启程" />
            </Form.Item>
            <Form.Item
              label="URL Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入URL标识' },
                { max: 200, message: '标识不能超过200个字符' },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="如: vol-1-departure" />
            </Form.Item>
          </div>

          <Form.Item label="卷/集简介" name="description">
            <TextArea
              rows={3}
              placeholder="卷/集的简要介绍..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Option value={VolumeStatus.DRAFT}>草稿</Option>
                <Option value={VolumeStatus.PUBLISHED}>连载中</Option>
                <Option value={VolumeStatus.COMPLETED}>已完结</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="isVisible"
              valuePropName="checked"
              label="是否可见"
              style={{ flex: 1 }}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="卷封面"
              name="cover"
              style={{ flex: 1 }}
            >
              <Upload {...uploadProps} listType="picture-card" maxCount={1}>
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>上传封面</div>
                </div>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VolumesPage;
