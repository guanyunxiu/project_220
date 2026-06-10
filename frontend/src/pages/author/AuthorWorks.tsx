import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Upload,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Rate,
  Image,
  Popconfirm,
  Empty,
  Dropdown,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  EyeOutlined as ViewsIcon,
  GiftOutlined,
  DollarOutlined,
  UploadOutlined,
  SettingOutlined,
  MoreOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UpOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ImageUploader from '../../components/ImageUploader';
import TipTapEditor from '../../components/TipTapEditor';

interface WorkItem {
  id: number;
  title: string;
  cover: string;
  category: string;
  tags: string[];
  status: 'ongoing' | 'completed' | 'draft';
  auditStatus: 'pending' | 'approved' | 'rejected';
  words: number;
  chapters: number;
  views: number;
  favorites: number;
  income: number;
  rating: number;
  updatedAt: string;
  progress: number;
}

const mockWorks: WorkItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `我的作品 ${i + 1}：${['诸天之旅', '都市传说', '仙侠奇缘', '末世求生'][i % 4]}`,
  cover: `https://picsum.photos/seed/authorwork${i}/300/400`,
  category: ['玄幻奇幻', '都市言情', '武侠仙侠', '科幻游戏'][i % 4],
  tags: ['爽文', '穿越', '系统'].slice(0, (i % 3) + 1),
  status: (['ongoing', 'ongoing', 'completed', 'draft'] as const)[i % 4],
  auditStatus: (['approved', 'approved', 'approved', 'pending'] as const)[i % 4],
  words: 200000 + i * 150000,
  chapters: 50 + i * 30,
  views: 50000 + i * 80000,
  favorites: 2000 + i * 3000,
  income: 10000 + i * 8500,
  rating: 8.5 + i * 0.1,
  updatedAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
  progress: 20 + i * 10,
}));

const categories = [
  '玄幻奇幻', '武侠仙侠', '都市言情', '历史军事', '科幻游戏',
  '悬疑灵异', '二次元', '同人衍生',
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
  { value: 'draft', label: '草稿箱' },
];

export default function AuthorWorks() {
  const [data, setData] = useState<WorkItem[]>(mockWorks);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [form] = Form.useForm();
  const [coverUrl, setCoverUrl] = useState('');

  const filtered = data.filter(
    (item) =>
      (!searchText || item.title.includes(searchText)) &&
      (filterStatus === 'all' || item.status === filterStatus)
  );

  const totalIncome = data.reduce((s, i) => s + i.income, 0);
  const totalWords = data.reduce((s, i) => s + i.words, 0);
  const ongoingCount = data.filter((w) => w.status === 'ongoing').length;
  const totalViews = data.reduce((s, i) => s + i.views, 0);

  const openCreate = () => {
    setEditingWork(null);
    form.resetFields();
    setCoverUrl('');
    setCreateModalOpen(true);
  };

  const openEdit = (work: WorkItem) => {
    setEditingWork(work);
    form.setFieldsValue({
      title: work.title,
      category: work.category,
      tags: work.tags,
      status: work.status === 'draft' ? 'ongoing' : work.status,
      description: `这是${work.title}的作品简介`,
    });
    setCoverUrl(work.cover);
    setCreateModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!coverUrl && !editingWork) {
        message.warning('请上传作品封面');
        return;
      }
      if (editingWork) {
        setData(
          data.map((w) =>
            w.id === editingWork.id
              ? { ...w, ...values, cover: coverUrl || w.cover }
              : w
          )
        );
        message.success('修改成功');
      } else {
        const newWork: WorkItem = {
          id: Date.now(),
          title: values.title,
          cover: coverUrl,
          category: values.category,
          tags: values.tags || [],
          status: values.status || 'draft',
          auditStatus: 'pending',
          words: 0,
          chapters: 0,
          views: 0,
          favorites: 0,
          income: 0,
          rating: 0,
          updatedAt: new Date().toISOString(),
          progress: 0,
        };
        setData([newWork, ...data]);
        message.success('作品创建成功，等待审核');
      }
      setCreateModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: number) => {
    setData(data.filter((w) => w.id !== id));
    message.success('删除成功');
  };

  const columns = [
    {
      title: '作品',
      dataIndex: 'title',
      key: 'work',
      width: 280,
      render: (_: any, record: WorkItem) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
            <img src={record.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/work/${record.id}`} className="font-medium truncate max-w-[150px] block hover:text-primary-500">
              {record.title}
            </Link>
            <div className="text-xs text-gray-500 mt-0.5">
              ID: {record.id} · {record.chapters}章
            </div>
            <div className="mt-1.5">
              <Progress percent={record.progress} size="small" showInfo={false} className="!mb-0" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c: string) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '状态',
      key: 'status',
      width: 160,
      render: (_: any, r: WorkItem) => (
        <Space direction="vertical" size={2}>
          <Tag
            color={
              r.status === 'ongoing'
                ? 'processing'
                : r.status === 'completed'
                ? 'success'
                : 'default'
            }
          >
            {r.status === 'ongoing' ? '连载中' : r.status === 'completed' ? '已完结' : '草稿'}
          </Tag>
          <Badge
            status={
              r.auditStatus === 'approved'
                ? 'success'
                : r.auditStatus === 'pending'
                ? 'warning'
                : 'error'
            }
            text={
              <span className="text-xs">
                {r.auditStatus === 'approved' ? '已通过' : r.auditStatus === 'pending' ? '审核中' : '已驳回'}
              </span>
            }
          />
        </Space>
      ),
    },
    {
      title: '字数',
      dataIndex: 'words',
      key: 'words',
      width: 100,
      render: (w: number) => `${(w / 10000).toFixed(1)}万`,
    },
    {
      title: '数据',
      key: 'stats',
      width: 180,
      render: (_: any, r: WorkItem) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1">
            <ViewsIcon className="text-blue-500" />
            <span>阅读：{(r.views / 10000).toFixed(1)}万</span>
          </div>
          <div className="flex items-center gap-1">
            <StarOutlined className="text-yellow-500" />
            <span>收藏：{(r.favorites / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarOutlined className="text-green-500" />
            <span>收入：¥{r.income.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (r: number) => (
        <div>
          <Rate value={r / 2} disabled count={5} className="!text-xs" />
          <div className="text-xs text-gray-500 mt-0.5">{r.toFixed(1)}分</div>
        </div>
      ),
    },
    {
      title: '最近更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (t: string) => dayjs(t).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, r: WorkItem) => (
        <Space size="small">
          <Link to={`/author/works/${r.id}/chapters`}>
            <Button type="primary" size="small" icon={<EditOutlined />}>
              编辑章节
            </Button>
          </Link>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            预览
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'edit', icon: <SettingOutlined />, label: '修改信息', onClick: () => openEdit(r) },
                { type: 'divider' as const },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: (
                    <Popconfirm
                      title="确定删除这个作品吗？"
                      onConfirm={() => handleDelete(r.id)}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <span className="text-red-500">删除作品</span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的作品</h1>
          <p className="text-gray-500 mt-1">管理你创作的所有作品</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="!h-11 !px-6"
        >
          创建新作品
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="连载中"
              value={ongoingCount}
              prefix={<BookOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="累计字数"
              value={(totalWords / 10000).toFixed(1)}
              suffix="万字"
              prefix={<FireOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="总阅读量"
              value={(totalViews / 10000).toFixed(1)}
              suffix="万"
              prefix={<EyeOutlined className="text-purple-500" />}
              valueStyle={{ color: '#a855f7' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="预计收入"
              value={totalIncome}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="!rounded-2xl">
        <div className="flex flex-wrap gap-3 mb-5 pb-5 border-b">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索作品名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 130 }}
            options={statusOptions}
            prefix={<FilterOutlined className="text-gray-400" />}
          />
        </div>

        {filtered.length === 0 ? (
          <Empty
            description="还没有作品，点击右上角创建你的第一部作品吧！"
            className="py-16"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 部作品`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingWork ? '编辑作品信息' : '创建新作品'}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setCreateModalOpen(false)}>取消</Button>
            <Button onClick={() => { form.setFieldValue('status', 'draft'); handleSubmit(); }}>
              保存草稿
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {editingWork ? '保存修改' : '提交审核'}
            </Button>
          </Space>
        }
        width={760}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item
                label="作品封面"
                name="cover"
                rules={[{ required: !editingWork, message: '请上传封面' }]}
              >
                <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
                  {coverUrl ? (
                    <>
                      <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      <Button
                        type="primary"
                        size="small"
                        danger
                        className="absolute top-2 right-2"
                        onClick={() => setCoverUrl('')}
                      >
                        移除
                      </Button>
                    </>
                  ) : (
                    <Upload.Dragger
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const reader = new FileReader();
                        reader.onload = (e) => setCoverUrl(e.target?.result as string);
                        reader.readAsDataURL(file);
                        return false;
                      }}
                      className="!border-0 !h-full flex items-center justify-center !bg-transparent"
                    >
                      <div className="text-center p-4">
                        <UploadOutlined className="text-4xl text-gray-300 mb-2 block" />
                        <p className="text-sm text-gray-500">点击或拖拽上传封面</p>
                        <p className="text-xs text-gray-400 mt-1">建议 600×800px，不超过5MB</p>
                      </div>
                    </Upload.Dragger>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item
                name="title"
                label="作品名称"
                rules={[
                  { required: true, message: '请输入作品名称' },
                  { min: 2, max: 50, message: '长度2-50字' },
                ]}
              >
                <Input placeholder="请输入作品名称" maxLength={50} showCount />
              </Form.Item>

              <Form.Item
                name="category"
                label="作品分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类" options={categories.map((c) => ({ value: c, label: c }))} />
              </Form.Item>

              <Form.Item name="tags" label="标签" tooltip="最多5个标签，便于读者搜索">
                <Select
                  mode="tags"
                  placeholder="输入后回车添加标签"
                  maxTagCount={5}
                  options={['爽文', '穿越', '系统', '重生', '甜宠', '升级', '无敌流'].map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="发布状态"
                initialValue="ongoing"
              >
                <Select
                  options={[
                    { value: 'ongoing', label: '连载中' },
                    { value: 'completed', label: '已完结' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="作品简介"
            rules={[
              { required: true, message: '请填写作品简介' },
              { min: 20, message: '简介至少20字' },
            ]}
            className="!mb-0"
          >
            <Input.TextArea
              rows={6}
              placeholder="请详细介绍你的作品，吸引读者阅读..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
